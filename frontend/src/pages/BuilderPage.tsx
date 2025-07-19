import React from "react";
import { useParams } from "react-router-dom";
import { BuilderComponent, builder } from "@builder.io/react";
import { BUILDER_PUBLIC_API_KEY } from "../lib/builder";
import { useBuilderContent } from "../hooks/useBuilderContent";

// This component renders pages managed by Builder.io
const BuilderPage: React.FC = () => {
  const { "*": path } = useParams();
  const currentPath = path ? `/${path}` : "/";

  const { content, loading, error } = useBuilderContent({
    model: "page",
    userAttributes: {
      urlPath: currentPath,
    },
    cachebust: import.meta.env.DEV,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Content
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This page hasn't been created in Builder.io yet.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
            <h3 className="font-semibold text-blue-800 mb-2">
              For Developers:
            </h3>
            <p className="text-blue-700">
              Create content for{" "}
              <code className="bg-blue-100 px-1 rounded">"{currentPath}"</code>{" "}
              in your Builder.io dashboard.
            </p>
          </div>
          <a
            href="/"
            className="inline-block mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <BuilderComponent
        model="page"
        content={content}
        apiKey={BUILDER_PUBLIC_API_KEY}
        options={{
          includeRefs: true,
          cachebust: import.meta.env.DEV,
        }}
      />
    </div>
  );
};

export default BuilderPage;
