import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "@/pages/Home";
import { JobChat } from "@/pages/JobChat";
import { JobDetail } from "@/pages/JobDetail";
import { JobNew } from "@/pages/JobNew";
import { MyJobs } from "@/pages/MyJobs";
import { MyOffers } from "@/pages/MyOffers";
import { Profile } from "@/pages/Profile";
import { PublicProfile } from "@/pages/PublicProfile";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  notFoundComponent: NotFound,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$id",
  component: JobDetail,
});

const jobNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/new",
  component: JobNew,
});

const jobChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$id/chat",
  component: JobChat,
});

const myJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-jobs",
  component: MyJobs,
});

const myOffersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-offers",
  component: MyOffers,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const publicProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$principal",
  component: PublicProfile,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  jobNewRoute,
  jobDetailRoute,
  jobChatRoute,
  myJobsRoute,
  myOffersRoute,
  profileRoute,
  publicProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function NotFound() {
  return (
    <div
      data-ocid="not_found.page"
      className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center"
    >
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        ไม่พบหน้าที่คุณกำลังมองหา
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ลิงก์อาจถูกเปลี่ยนหรือหน้านี้ถูกลบไปแล้ว
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/" data-ocid="not_found.home_button">
          กลับไปหน้าหลัก
        </Link>
      </Button>
    </div>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
