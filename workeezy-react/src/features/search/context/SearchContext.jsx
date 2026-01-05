import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    useNavigate,
    useSearchParams,
    useNavigationType,
    useLocation,
} from "react-router-dom";
import api, { getDeduped } from "../../../api/axios.js";

const SearchContext = createContext(null);

const REGION_MAP = {
    수도권: ["서울", "경기", "인천"],
    영남권: ["부산", "대구", "울산", "경남", "경북"],
    호남권: ["광주", "전남", "전북"],
    충청권: ["대전", "충북", "충남"],
    강원권: ["강원"],
    제주: ["제주"],
    해외: ["해외"],
};

function safeParseJson(v) {
    try {
        return JSON.parse(v);
    } catch {
        return null;
    }
}

export function SearchProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const navType = useNavigationType();

    const [params] = useSearchParams();
    const urlKeyword = (params.get("keyword") || "").trim();

    // state
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const ignoreUrlOnPop = navType === "POP" && location.pathname === "/search";
    const effectiveKeyword = keyword || (ignoreUrlOnPop ? "" : urlKeyword);


    // region filters
    const [bigRegion, setBigRegionState] = useState("전체");
    const [smallRegions, setSmallRegionsState] = useState([]);

    // view / pagination
    const [viewMode, setViewModeState] = useState("list");
    const [currentPage, setCurrentPageState] = useState(1);
    const pageSize = 6;

    // data
    const [allPrograms, setAllPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    // recommended
    const [recommended, setRecommended] = useState(() => {
        const saved = localStorage.getItem("workeezy_recommended_v1");
        const parsed = saved ? safeParseJson(saved) : null;
        return Array.isArray(parsed) ? parsed : [];
    });

    useEffect(() => {
        localStorage.setItem("workeezy_recommended_v1", JSON.stringify(recommended));
    }, [recommended]);

    const fetchRecommendedAndAppend = useCallback(async () => {
        try {
            // ✅ dedupe 적용 (StrictMode에도 1번만)
            const res = await getDeduped("/api/recommendations/recent");
            const incoming = Array.isArray(res.data) ? res.data : [];

            setRecommended((prev) => {
                const used = new Set(prev.map((p) => p?.id));
                const nextOne = incoming.find((p) => p?.id && !used.has(p.id));
                return nextOne ? [nextOne, ...prev].slice(0, 10) : prev;
            });
        } catch (e) {
            console.error("recommend fetch failed", e);
        }
    }, []);
    useEffect(() => {
        const ignoreUrlOnPop = navType === "POP" && location.pathname === "/search";
        if (ignoreUrlOnPop) return;

        if (urlKeyword) {
            setKeyword(urlKeyword);
            setSearchInput(urlKeyword);
        }
    }, [urlKeyword, navType, location.pathname]);



    // ✅ A안: Search 진입 시 추천은 1회만 가져오면 충분 (dedupe가 있으니 StrictMode도 OK)
    useEffect(() => {
        fetchRecommendedAndAppend();
    }, [fetchRecommendedAndAppend]);

    // UI 초기화
    const resetSearchUI = useCallback(() => {
        setKeyword("");
        setSearchInput("");
        setBigRegionState("전체");
        setSmallRegionsState([]);
        setCurrentPageState(1);
        setViewModeState("list");
        setHasFetched(false);
    }, []);

    // POP(뒤로/새로고침) 처리
    useEffect(() => {
        if (navType === "POP" && location.pathname === "/search") {
            if (urlKeyword !== "") {
                navigate("/search", { replace: true });
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            resetSearchUI();
        }
    }, [navType, location.pathname, urlKeyword, navigate, resetSearchUI]);


    // ✅ fetch (A안 유지: 키워드 없으면 전체 cards)
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                if (!cancelled) {
                    setIsLoading(true);
                    setHasFetched(false);
                }

                const k = (effectiveKeyword || "").trim();

                if (!k) {
                    // ✅ 전체조회도 dedupe 적용 (StrictMode에도 1번만)
                    const res = await getDeduped("/api/programs/cards");
                    if (!cancelled) setAllPrograms(Array.isArray(res.data) ? res.data : []);
                    return;
                }

                // ✅ 검색도 dedupe 적용 (같은 키면 1번만)
                const res = await getDeduped("/api/search", { params: { keyword: k } });

                const cards = Array.isArray(res.data?.cards)
                    ? res.data.cards
                    : Array.isArray(res.data)
                        ? res.data
                        : [];

                if (!cancelled) setAllPrograms(cards);
            } catch (e) {
                console.error("search error", e);
                if (!cancelled) setAllPrograms([]);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setHasFetched(true);
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [effectiveKeyword]);

    // region filtering
    const filteredPrograms = useMemo(() => {
        if (bigRegion === "전체") return allPrograms;

        if (smallRegions.length > 0) {
            const set = new Set(smallRegions);
            return allPrograms.filter((p) => p?.region && set.has(p.region));
        }

        const allowed = REGION_MAP[bigRegion] || [];
        const set = new Set(allowed);
        return allPrograms.filter((p) => p?.region && set.has(p.region));
    }, [allPrograms, bigRegion, smallRegions]);

    // pagination
    const totalPages = useMemo(() => {
        const tp = Math.ceil(filteredPrograms.length / pageSize);
        return tp <= 0 ? 1 : tp;
    }, [filteredPrograms.length, pageSize]);

    const paginatedPrograms = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPrograms.slice(start, start + pageSize);
    }, [filteredPrograms, currentPage, pageSize]);

    const isEmpty = hasFetched && !isLoading && paginatedPrograms.length === 0;

    // actions
    const submitSearch = useCallback(
        (overrideKeyword) => {
            const trimmed = (overrideKeyword ?? searchInput).trim();
            setHasFetched(false);

            if (!trimmed) {
                navigate("/search", { replace: false });
                resetSearchUI();
                return;
            }

            setKeyword(trimmed);
            setSearchInput(trimmed);
            navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);

            setCurrentPageState(1);
            setViewModeState("list");
        },
        [navigate, searchInput, resetSearchUI]
    );

    const setBigRegion = useCallback((r) => {
        setBigRegionState(r);
        setSmallRegionsState([]);
        setCurrentPageState(1);
        setViewModeState("list");
    }, []);

    const setSmallRegions = useCallback((updaterOrList) => {
        setSmallRegionsState((prev) => {
            const next =
                typeof updaterOrList === "function" ? updaterOrList(prev) : updaterOrList;
            return Array.isArray(next) ? next : [];
        });
        setCurrentPageState(1);
        setViewModeState("list");
    }, []);

    const setViewMode = useCallback((m) => {
        setViewModeState(m);
        setCurrentPageState(1);
    }, []);

    const setCurrentPage = useCallback((p) => {
        setCurrentPageState(p);
    }, []);

    const value = {
        searchInput,
        setSearchInput,
        submitSearch,

        bigRegion,
        smallRegions,
        setBigRegion,
        setSmallRegions,

        viewMode,
        setViewMode,

        isLoading,
        hasFetched,
        allPrograms,
        filteredPrograms,
        paginatedPrograms,
        isEmpty,

        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,

        recommended,
    };

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
    const ctx = useContext(SearchContext);
    if (!ctx) throw new Error("useSearch must be used within SearchProvider");
    return ctx;
}
