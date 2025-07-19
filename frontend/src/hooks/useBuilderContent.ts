import { useState, useEffect } from "react";
import { builder } from "@builder.io/react";
import { BUILDER_PUBLIC_API_KEY } from "../lib/builder";

interface UseBuilderContentOptions {
  model: string;
  query?: any;
  userAttributes?: any;
  cachebust?: boolean;
}

export function useBuilderContent({
  model,
  query = {},
  userAttributes = {},
  cachebust = false,
}: UseBuilderContentOptions) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const content = await builder
          .get(model, {
            apiKey: BUILDER_PUBLIC_API_KEY,
            userAttributes: {
              urlPath: window.location.pathname,
              ...userAttributes,
            },
            query: {
              ...query,
              ...(cachebust && { cachebust: true }),
            },
          })
          .toPromise();

        if (!isCancelled) {
          setContent(content);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch content",
          );
          console.error("Builder.io content fetch error:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isCancelled = true;
    };
  }, [model, JSON.stringify(query), JSON.stringify(userAttributes), cachebust]);

  return { content, loading, error };
}

export function useBuilderQuery(model: string, options: any = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await builder.getAll(model, {
          apiKey: BUILDER_PUBLIC_API_KEY,
          limit: options.limit || 10,
          ...options,
        });

        if (!isCancelled) {
          setResults(results);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch results",
          );
          console.error("Builder.io query error:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [model, JSON.stringify(options)]);

  return { results, loading, error };
}
