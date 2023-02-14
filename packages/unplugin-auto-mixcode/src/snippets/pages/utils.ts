import { isPackageExists } from "local-pkg";

export const getReactRouter = () =>
  (["react-router-native"].find((pkg) => isPackageExists(pkg)) as
    | "react-router-native"
    | undefined) ?? "react-router-dom";
