import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "@/components/ui/sonner";
import { EnterpriseProvider } from "@/context/EnterpriseContext";
import { routeTree } from "./routeTree.gen";

import "./styles.css";

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<EnterpriseProvider>
				<RouterProvider router={router} />
				<Toaster />
			</EnterpriseProvider>
		</StrictMode>,
	);
}
