import { useSelector } from "react-redux";

export default function useAuthGuard() {
  return useSelector((state) => state.auth.user);
}
