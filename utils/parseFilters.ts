import React from "react";

const parseFilters = (filters: Record<string, React.Key[] | null>): string => {
    return Object.keys(filters)
        .filter((f) => Array.isArray(filters[f]) && filters[f]!.length > 0)
        .map(f => f + '=' + filters[f]?.join(','))
        .join('&')
}

export default parseFilters
