import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/main.layout";

const router = createBrowserRouter([
	{
		element: <MainLayout />,
		children: [
			{
				path: "/",
				element: (
					<h1>Mergio v0.0.1</h1>
				),
			},
		],
	},
]);

export { router };
