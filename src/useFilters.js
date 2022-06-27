import { useState } from "react";

export default function useFilters(transactions, initialFilter) {
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  const [myFilters, setMyFilters] = useState([]);

  function filter(transactions) {
    const filtered = transactions
      .filter(
        (t) =>
          t.memo.toLowerCase().includes(currentFilter.text) ||
          t.categ.toLowerCase().includes(currentFilter.text)
      )
      .filter((t) => t.date >= currentFilter.minDate)
      .filter((t) => t.date <= currentFilter.maxDate);

    return filtered;
  }

  const current = filter(transactions);
  const filtered = transactions.filter((t) => !t.ignored);
  const currentFiltered = current.filter((t) => !t.ignored);

  function saveFilter(f) {
    setMyFilters([...myFilters, f]);
  }

  return {
    filtered,
    current,
    currentFilter,
    setCurrentFilter,
    currentFiltered,
    myFilters,
    saveFilter,
  };
}
