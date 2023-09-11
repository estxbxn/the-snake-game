// @refresh reload
import {Component, Suspense} from "solid-js";
import {Body, ErrorBoundary, FileRoutes, Head, Html, Link, Meta, Routes, Scripts, Title,} from "solid-start";

import "./root.css";

import SnakeLoading from "~/components/snake-loading";

const Root: Component = () => {
	return (
		<Html lang="en">
			<Head>
				<Title>The Snake Game in TypeScript</Title>
				<Meta charset="utf-8"/>
				<Meta name="viewport" content="width=device-width, initial-scale=1"/>
				<Meta name="theme-color" content="#5f8785"/>

				{/* favicon */}
				<Link rel="icon" type="image/x-icon" href="/snake.svg"/>

				{/* thumbnail (large) */}
				<Meta name="twitter:card" content="summary_large_image"/>

				{/* title */}
				<Meta property="og:title" content="The Snake Game in TypeScript"/>

				{/* description */}
				<Meta name="description" content="The Snake Game in TypeScript."/>

				<Link rel="preconnect" href="https://fonts.googleapis.com"/>
				<Link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossorigin={"anonymous"}
				/>
				<Link
					href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<Body class="bg-background font-fira overflow-x-hidden flex">
				<div
					class="bg-primary-200 flex-grow flex flex-col overflow-y-auto">
					<Suspense fallback={<SnakeLoading/>}>
						<ErrorBoundary>
							<Routes>
								<FileRoutes/>
							</Routes>
						</ErrorBoundary>
					</Suspense>
				</div>
				<Scripts/>
			</Body>
		</Html>
	);
};

export default Root;
