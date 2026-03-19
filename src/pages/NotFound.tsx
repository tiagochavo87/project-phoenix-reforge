import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleDot } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <CircleDot className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Button asChild>
        <Link to="/home">Go Home</Link>
      </Button>
    </div>
  );
}
