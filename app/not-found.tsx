export default function NotFound() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">
        Page not found
      </p>

      <a
        href="/"
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Go Home
      </a>
    </div>
  );
}