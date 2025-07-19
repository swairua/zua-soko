import React from "react";
import { BuilderComponent, builder } from "@builder.io/react";
import { BUILDER_PUBLIC_API_KEY } from "../lib/builder";

interface BuilderPageProps {
  model?: string;
  content?: any;
  path?: string;
}

const BuilderPage: React.FC<BuilderPageProps> = ({
  model = "page",
  content,
  path = window.location.pathname,
}) => {
  return (
    <BuilderComponent
      model={model}
      content={content}
      apiKey={BUILDER_PUBLIC_API_KEY}
      options={{
        includeRefs: true,
        cachebust: import.meta.env.DEV,
      }}
    />
  );
};

export default BuilderPage;
