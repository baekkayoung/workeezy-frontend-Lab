import CategoryFilter from "./CategoryFilter.jsx";
import { useSearch } from "../context/SearchContext.jsx";

export default function CategoryFilterConnected() {
    const { bigRegion, smallRegions, setBigRegion, setSmallRegions, resetAllSearch } = useSearch();

    return (
        <CategoryFilter
            bigRegion={bigRegion}
            smallRegions={smallRegions}
            setBigRegion={setBigRegion}
            setSmallRegions={setSmallRegions}
            resetAllSearch={resetAllSearch}
        />
    );
}
