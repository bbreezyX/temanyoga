export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Temanyoga</p>
          <p>Gantungan kunci handmade berkualitas</p>
          <p>&copy; {new Date().getFullYear()} Temanyoga. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
