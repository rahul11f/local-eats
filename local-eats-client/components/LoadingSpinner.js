export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-light rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-secondary font-medium">Loading...</p>
      </div>
    </div>
  );
}
