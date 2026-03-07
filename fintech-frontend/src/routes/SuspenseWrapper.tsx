import { Suspense } from "react";
import Loading from "../components/common/Loading";

export default function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
