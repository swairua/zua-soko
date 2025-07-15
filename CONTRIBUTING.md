# Contributing to Zuasoko

Thank you for your interest in contributing to the Zuasoko platform! This document provides guidelines and information for contributors.

## 🌟 Welcome Contributors

We welcome contributions from developers, designers, testers, and agricultural experts who want to help improve the platform that empowers smallholder farmers.

### Ways to Contribute

- 🐛 **Bug Reports**: Report issues you encounter
- 💡 **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Submit code improvements and fixes
- 📚 **Documentation**: Improve or add documentation
- 🎨 **Design**: UI/UX improvements and feedback
- 🧪 **Testing**: Help test new features and report issues
- 🌍 **Localization**: Help translate the platform
- 📖 **Content**: Agricultural expertise and content creation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git knowledge
- Basic understanding of React/Next.js
- Familiarity with TypeScript (preferred)

### Development Setup

1. **Fork the Repository**

   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/zuasoko.git
   cd zuasoko
   ```

2. **Set Up Development Environment**

   ```bash
   # Install dependencies
   npm install

   # Copy environment variables
   cp .env.example .env.local

   # Set up database
   npm run db:generate
   npm run db:push
   npm run db:seed

   # Start development server
   npm run dev
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

## 📋 Contribution Guidelines

### Code Style

#### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add type annotations for function parameters and return types

```typescript
// Good
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

async function createUser(userData: UserProfile): Promise<User> {
  // Implementation
}

// Avoid
function createUser(data: any): any {
  // Implementation
}
```

#### React Components

- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components focused and single-purpose
- Use proper prop types

```tsx
// Good
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  className,
}: ProductCardProps) {
  return <div className={`card ${className}`}>{/* Component content */}</div>;
}
```

#### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Maintain accessibility standards

```tsx
// Good - Mobile-first responsive design
<div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Good - Semantic naming
<button className="btn-primary" aria-label="Add to cart">

// Avoid - Arbitrary values without good reason
<div className="w-[347px] h-[293px]">
```

### API Development

#### Route Structure

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // Business logic here

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error message",
      },
      { status: 400 },
    );
  }
}
```

#### Database Operations

- Use Prisma ORM for all database operations
- Implement proper error handling
- Use transactions for related operations
- Optimize queries for performance

```typescript
// Good - Efficient query with proper selection
const products = await prisma.produce.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    farmer: {
      select: {
        county: true,
        user: { select: { firstName: true, lastName: true } },
      },
    },
  },
  where: { isAvailable: true },
  take: 20,
});

// Good - Using transactions
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const farmer = await tx.farmer.create({
    data: { ...farmerData, userId: user.id },
  });
  return { user, farmer };
});
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(farmer): add GPS location capture for consignments
fix(payment): resolve STK push timeout issues
docs(api): update payment endpoint documentation
style(ui): improve mobile button sizing
refactor(auth): simplify user registration flow
test(payment): add M-Pesa integration tests
chore(deps): update dependencies to latest versions
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Scopes

- `farmer`: Farmer-related features
- `customer`: Customer-related features
- `admin`: Admin portal features
- `payment`: Payment system
- `auth`: Authentication system
- `ui`: User interface
- `api`: API endpoints
- `db`: Database related

### Testing

#### Unit Tests

```typescript
// components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    // ... other properties
  };

  it('displays product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('KES 100')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

#### API Tests

```typescript
// app/api/products.test.ts
import { createMocks } from "node-mocks-http";
import handler from "./products/route";

describe("/api/products", () => {
  it("returns products list", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test ProductCard.test.tsx

# Run tests with coverage
npm run test:coverage
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear Title**: Describe the issue concisely
2. **Environment**: OS, browser, device type
3. **Steps to Reproduce**: Step-by-step instructions
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Additional Context**: Error messages, logs

**Template:**

```markdown
## Bug Report

**Environment:**

- OS: macOS 12.6
- Browser: Chrome 108
- Device: Desktop

**Steps to Reproduce:**

1. Go to farmer dashboard
2. Click "New Consignment"
3. Fill in product details
4. Click "Submit"

**Expected Behavior:**
Consignment should be created successfully

**Actual Behavior:**
Page shows error "Failed to create consignment"

**Screenshots:**
[Attach screenshots]

**Additional Context:**
Console shows: TypeError: Cannot read property 'location' of undefined
```

### Feature Requests

For feature requests, please include:

1. **Use Case**: Why is this feature needed?
2. **User Story**: As a [user type], I want [goal] so that [benefit]
3. **Acceptance Criteria**: What defines "done"?
4. **Design Considerations**: UI/UX considerations if applicable

## 🔄 Pull Request Process

### Before Submitting

1. **Test Your Changes**

   ```bash
   npm run lint        # Check code style
   npm run type-check  # TypeScript validation
   npm test            # Run tests
   npm run build       # Verify build works
   ```

2. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Update user guides if applicable

3. **Check Performance**
   - Test on mobile devices
   - Verify PWA functionality
   - Check loading times

### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Mobile testing completed

## Screenshots (if applicable)

[Add screenshots]

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review code for quality and standards
3. **Testing**: Manual testing of functionality
4. **Documentation Review**: Ensure documentation is updated
5. **Approval**: At least one maintainer approval required
6. **Merge**: Squash and merge to main branch

## 🏗️ Architecture Guidelines

### Project Structure

```
zuasoko/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API endpoints
│   ├── farmer/            # Farmer portal
│   └── marketplace/       # Public marketplace
├── components/            # Reusable components
│   ├── ui/                # Generic UI components
│   ├── admin/             # Admin-specific components
│   └── forms/             # Form components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── docs/                  # Documentation
```

### Component Guidelines

#### Component Categories

1. **UI Components** (`components/ui/`)
   - Generic, reusable components
   - No business logic
   - Well-documented props

2. **Feature Components** (`components/[feature]/`)
   - Feature-specific components
   - Can contain business logic
   - Composed of UI components

3. **Page Components** (`app/*/page.tsx`)
   - Top-level page components
   - Handle data fetching
   - Compose feature components

#### Example Component Structure

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-colors duration-200";
  const variantClasses = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### State Management

#### Local State

- Use `useState` for component-specific state
- Use `useReducer` for complex state logic

#### Global State

- React Context for global application state
- Custom hooks for state logic

```tsx
// contexts/CartContext.tsx
interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
} | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
```

## 🌍 Internationalization

### Adding Translations

1. **Add translation keys** to language files
2. **Use translation hooks** in components
3. **Test with different languages**

```tsx
// lib/i18n.ts
export const translations = {
  en: {
    common: {
      add_to_cart: "Add to Cart",
      loading: "Loading...",
    },
    farmer: {
      dashboard_title: "Farmer Dashboard",
      new_consignment: "New Consignment",
    },
  },
  sw: {
    common: {
      add_to_cart: "Ongeza kwenye Kago",
      loading: "Inapakia...",
    },
    farmer: {
      dashboard_title: "Dashibodi ya Mkulima",
      new_consignment: "Consignment Mpya",
    },
  },
};

// Usage in components
const { t } = useTranslation();
return <button>{t("common.add_to_cart")}</button>;
```

## 🚀 Performance Guidelines

### Frontend Performance

1. **Code Splitting**

   ```tsx
   const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
     loading: () => <LoadingSpinner />,
   });
   ```

2. **Image Optimization**

   ```tsx
   import Image from "next/image";

   <Image
     src="/product.jpg"
     alt="Product"
     width={500}
     height={300}
     priority={isAboveFold}
   />;
   ```

3. **Lazy Loading**

   ```tsx
   const LazyComponent = lazy(() => import("./HeavyComponent"));

   <Suspense fallback={<Loading />}>
     <LazyComponent />
   </Suspense>;
   ```

### Backend Performance

1. **Database Optimization**

   ```typescript
   // Use select to limit fields
   const users = await prisma.user.findMany({
     select: { id: true, name: true },
     take: 20,
   });

   // Use proper indexing
   @@index([email, status])
   ```

2. **Caching**

   ```typescript
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);

   const data = await fetchExpensiveData();
   await redis.setex(cacheKey, 300, JSON.stringify(data));
   ```

## 📱 Mobile Development

### PWA Guidelines

1. **Service Worker**
   - Cache critical resources
   - Implement background sync
   - Handle offline scenarios

2. **Responsive Design**
   - Mobile-first approach
   - Touch-friendly interfaces
   - Performance optimization

3. **Accessibility**
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast compliance

## 🔐 Security Guidelines

### Input Validation

```typescript
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^(\+254|254|0)?[17]\d{8}$/),
  password: z.string().min(8),
});
```

### Authentication

- Use NextAuth.js for authentication
- Implement proper session management
- Protect API routes with middleware

### Data Protection

- Sanitize user inputs
- Use environment variables for secrets
- Implement proper error handling without exposing internal details

## 🎯 Agricultural Domain Knowledge

### Contributing Agricultural Expertise

If you have agricultural knowledge, you can contribute by:

1. **Content Creation**
   - Crop growing guides
   - Seasonal farming calendars
   - Pest and disease management

2. **Feature Suggestions**
   - Farmer workflow improvements
   - Market analysis features
   - Agricultural best practices

3. **Validation**
   - Review agricultural content for accuracy
   - Test features with real farming scenarios
   - Provide feedback on farmer user experience

## 📞 Community & Support

### Communication Channels

- **GitHub Discussions**: General questions and feature discussions
- **Discord/Slack**: Real-time community chat
- **Email**: maintainers@zuasoko.com

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Recognition

Contributors will be recognized in:

- Repository contributors list
- Release notes acknowledgments
- Project documentation
- Community showcase

## 📚 Learning Resources

### Technologies Used

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **Prisma**: [prisma.io/docs](https://www.prisma.io/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Recommended Reading

- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://typescript-cheatsheets.netlify.app/)
- [Web Accessibility Guidelines](https://web.dev/accessibility/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

---

## 🙏 Thank You

Thank you for contributing to Zuasoko! Your efforts help create a platform that empowers smallholder farmers and strengthens agricultural communities.

Together, we're building technology that makes a real difference in people's lives. 🌱

---

_For questions about contributing, please reach out to the maintainers or open a discussion on GitHub._
