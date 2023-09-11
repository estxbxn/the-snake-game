import {lazy, Suspense} from "solid-js";
import {ErrorBoundary} from "solid-start";
import SnakeLoading from "~/components/snake-loading";

const SnakeGame = lazy(async () => import("~/components/snake"));

export default function Home() {
	return (
		<main>
			<Suspense fallback={<SnakeLoading/>}>
				<ErrorBoundary>
					<SnakeGame/>
				</ErrorBoundary>
			</Suspense>
		</main>
	);
}