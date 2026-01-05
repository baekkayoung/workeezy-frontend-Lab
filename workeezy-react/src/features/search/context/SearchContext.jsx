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

    // ✅ 뒤로가기(Pop)일 때도 URL에 keyword가 있으면 그걸 유지해야 함
    const effectiveKeyword = keyword || urlKeyword;

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
        localStorage.setItem(
            "workeezy_recommended_v1",
            JSON.stringify(recommended)
        );
    }, [recommended]);

    const fetchRecommendedAndAppend = useCallback(async () => {
        try {
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
        fetchRecommendedAndAppend();
    }, [fetchRecommendedAndAppend]);

    // ✅ URL keyword가 바뀌면 input/state 동기화
    useEffect(() => {
        if (urlKeyword) {
            setKeyword(urlKeyword);
            setSearchInput(urlKeyword);
        }
    }, [urlKeyword]);

    // UI 초기화(상태만)
    const resetSearchUI = useCallback(() => {
        setKeyword("");
        setSearchInput("");
        setBigRegionState("전체");
        setSmallRegionsState([]);
        setCurrentPageState(1);
        setViewModeState("list");
        setHasFetched(false);
    }, []);

    // ✅ "전체" 버튼용: 상태 + URL까지 초기화
    const resetAllSearch = useCallback(() => {
        resetSearchUI();
        navigate("/search", { replace: false });
    }, [resetSearchUI, navigate]);

    // ✅ 뒤로가기(Pop)로 /search 진입: URL에 keyword 있으면 유지, 없으면 초기화
    useEffect(() => {
        if (navType === "POP" && location.pathname === "/search") {
            if (urlKeyword) {
                setKeyword(urlKeyword);
                setSearchInput(urlKeyword);
                setHasFetched(false);
                setCurrentPageState(1);
                setViewModeState("list");
                return;
            }
            resetSearchUI();
        }
    }, [navType, location.pathname, urlKeyword, resetSearchUI]);

    // fetch programs based on keyword
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
                    const res = await getDeduped("/api/programs/cards");
                    if (!cancelled) {
                        setAllPrograms(Array.isArray(res.data) ? res.data : []);
                    }
                    return;
                }

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

        resetAllSearch, // ✅ 전체 버튼에서 사용할 것

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
