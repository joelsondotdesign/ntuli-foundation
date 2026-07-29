import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero flat">
        <div className="container">
          <span className="eyebrow">404</span>
          <h1 className="display">This page has moved on.</h1>
          <p className="lead">
            The page you were looking for is not here. It may have been renamed, or the link that brought you here may be
            out of date.
          </p>
          <Link className="btn btn-dark" href="/" prefetch={false}>
            Return home
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
