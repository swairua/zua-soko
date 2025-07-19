import { Builder } from '@builder.io/react';

// Import your existing components that you want to make available in Builder.io
// Example imports - adjust based on your actual components
// import { DatabaseStatus } from '../components/DatabaseStatus';
// import { ErrorBoundary } from '../components/ErrorBoundary';

// Example custom component for Builder.io
const HeroSection = (props: { title: string; subtitle: string; buttonText: string; buttonLink: string }) => {
  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{props.title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{props.subtitle}</p>
        {props.buttonText && props.buttonLink && (
          <a 
            href={props.buttonLink}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {props.buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

const FeatureCard = (props: { title: string; description: string; icon?: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {props.icon && (
        <div className="text-3xl mb-4">{props.icon}</div>
      )}
      <h3 className="text-xl font-semibold mb-2">{props.title}</h3>
      <p className="text-gray-600">{props.description}</p>
    </div>
  );
};

// Register components with Builder.io
export function registerBuilderComponents() {
  // Register Hero Section
  Builder.registerComponent(HeroSection, {
    name: 'HeroSection',
    friendlyName: 'Hero Section',
    inputs: [
      {
        name: 'title',
        type: 'string',
        defaultValue: 'Welcome to Zuasoko',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'string',
        defaultValue: 'Connecting farmers directly with customers',
        required: true,
      },
      {
        name: 'buttonText',
        type: 'string',
        defaultValue: 'Get Started',
      },
      {
        name: 'buttonLink',
        type: 'string',
        defaultValue: '/marketplace',
      },
    ],
  });

  // Register Feature Card
  Builder.registerComponent(FeatureCard, {
    name: 'FeatureCard',
    friendlyName: 'Feature Card',
    inputs: [
      {
        name: 'title',
        type: 'string',
        defaultValue: 'Feature Title',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        defaultValue: 'Feature description goes here',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        defaultValue: '🌱',
        helperText: 'Use an emoji or icon',
      },
    ],
  });

  // You can register more of your existing components here
  // Example:
  // Builder.registerComponent(DatabaseStatus, {
  //   name: 'DatabaseStatus',
  //   friendlyName: 'Database Status',
  //   inputs: [],
  // });

  console.log('✅ Builder.io components registered successfully');
}