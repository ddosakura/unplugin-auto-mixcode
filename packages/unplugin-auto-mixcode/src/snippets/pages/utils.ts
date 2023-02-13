import { isPackageExists } from "local-pkg";

export const getReactRouter = () => {
  return (
    ["react-router-dom", "react-router-native"].find((pkg) =>
      isPackageExists(pkg),
    ) ?? "react-router"
  );
};
