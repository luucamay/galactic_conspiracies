import { createBrowserRouter } from "react-router";
import { Welcome } from "./components/Welcome";
import { Connecting } from "./components/Connecting";
import { DeployWallet } from "./components/DeployWallet";
import { DepositForm } from "./components/DepositForm";
import { ReviewDeposit } from "./components/ReviewDeposit";
import { TransactionStatus } from "./components/TransactionStatus";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Welcome,
    },
    {
      path: "/connecting",
      Component: Connecting,
    },
    {
      path: "/deploy-wallet",
      Component: DeployWallet,
    },
    {
      path: "/deposit",
      Component: DepositForm,
    },
    {
      path: "/review",
      Component: ReviewDeposit,
    },
    {
      path: "/transaction",
      Component: TransactionStatus,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
