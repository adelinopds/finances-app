import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Stack, Tab, TextField, Typography } from "@mui/material";
import { useState } from "react";
import Transactions from "./Transactions";
import useTransactions from "./useTransactions";
import Visualization from "./Visualization";

function App() {
  const [tab, setTab] = useState("1");
  const [filterMemo, setFilterMemo] = useState("");
  const {
    transactions,
    unfiltered,
    ignore,
    unignore,
    setUnfiltered,
    setOpenFiles,
  } = useTransactions();

  const filtered = unfiltered.filter((t) =>
    t.memo.toLowerCase().includes(filterMemo)
  );

  function ignoreSelected() {
    ignore(filtered);
  }

  function unignoreSelected() {
    unignore(filtered);
  }

  return (
    <Stack sx={{ height: "98vh", padding: "1vh" }}>
      <Typography variant="h2">Finances</Typography>
      <TextField
        value={filterMemo}
        onChange={(e) => setFilterMemo(e.target.value)}
        label="filter memo"
      />
      <Button onClick={ignoreSelected}>Ignore selected</Button>
      <Button onClick={unignoreSelected}>Unignore selected</Button>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={(e, tab) => setTab(tab)}
            aria-label="lab API tabs example"
          >
            <Tab label="Transactions" value="1" />
            <Tab label="Visualization" value="2" />
          </TabList>
        </Box>
        <TabPanel
          sx={{ overflow: "hidden", height: "100%", overflowY: "scroll" }}
          value="1"
        >
          <Transactions
            transactions={filtered}
            ignore={ignore}
            unignore={unignore}
            setUnfiltered={setUnfiltered}
            setOpenFiles={setOpenFiles}
          />
        </TabPanel>
        <TabPanel sx={{ overflow: "hidden", height: "100%" }} value="2">
          {transactions.length > 0 ? (
            <Visualization transactions={transactions} />
          ) : (
            "Select at least one transaction"
          )}
        </TabPanel>
      </TabContext>
    </Stack>
  );
}

export default App;
