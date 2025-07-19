import React from "react";
import { BuilderComponent } from "@builder.io/react";
import { BUILDER_PUBLIC_API_KEY } from "../lib/builder";

interface BuilderSectionProps {
  sectionName: string;
  content?: any;
  data?: any;
}

const BuilderSection: React.FC<BuilderSectionProps> = ({
  sectionName,
  content,
  data = {},
}) => {
  return (
    <BuilderComponent
      model="section"
      content={content}
      data={data}
      apiKey={BUILDER_PUBLIC_API_KEY}
      options={{
        includeRefs: true,
        cachebust: import.meta.env.DEV,
        userAttributes: {
          section: sectionName,
        },
      }}
    />
  );
};

export default BuilderSection;
