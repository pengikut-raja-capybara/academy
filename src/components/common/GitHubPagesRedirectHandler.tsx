import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type GitHubPagesRedirectHandlerProps = {
  children: React.ReactNode;
};

export function GitHubPagesRedirectHandler({ children }: GitHubPagesRedirectHandlerProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/" && location.search.startsWith("?redirect=")) {
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get("redirect");

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [location.pathname, location.search, navigate]);

  return children;
}