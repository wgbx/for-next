"use client";

import { shopHomeQueryAtom } from "@/lib/atoms/shop";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useAtomValue } from "jotai";

export function ShopHomeClient() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useAtomValue(shopHomeQueryAtom);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="body2" color="text.secondary">
        客户端请求接口（每个用户都会请求一次，但接口背后应复用缓存）
      </Typography>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          fontFamily: "monospace",
          fontSize: 14,
        }}
      >
        {isPending ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} />
            <span>loading…</span>
          </Box>
        ) : null}

        {isError ? (
          <Alert severity="error">
            {error instanceof Error ? error.message : String(error)}
          </Alert>
        ) : null}

        {data ? (
          <>
            <div>servedBy={data.servedBy}</div>
            <div>hits={data.hits}</div>
            <div>backendServedAt={data.backendServedAt}</div>
          </>
        ) : null}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "刷新中…" : "只刷新接口（不刷新整页）"}
        </Button>
      </Box>
    </Paper>
  );
}
