
import ComplexForm from "./components/ComplexForm";
import ErrorBoundary from "./components/ErrorBoundary";

export default function Home() {
  return (
    <main className="page-container">
      <ErrorBoundary>
        <ComplexForm />
      </ErrorBoundary>
    </main>
  );
}
