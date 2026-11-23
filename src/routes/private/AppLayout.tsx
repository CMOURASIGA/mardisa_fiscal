import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";

const AppLayout: React.FC = () => {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				<Sidebar />
				<div className="flex-1 flex flex-col min-h-screen">
					<Header />
					<main className="flex-1 p-6">
						<div className="mx-auto max-w-7xl">
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};

export default AppLayout;
