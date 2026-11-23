import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "./AppLayout";

export const Route = createFileRoute("/private")({
	component: AppLayout,
});
