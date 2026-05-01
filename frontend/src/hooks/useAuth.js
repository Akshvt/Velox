import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMeThunk } from "../store/authSlice";

/** Returns { user, token, status, isAuth } and auto-fetches profile on mount. */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, status } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user && status !== "loading") {
      dispatch(getMeThunk());
    }
  }, [token, user, status, dispatch]);

  return { user, token, status, isAuth: !!user };
}
