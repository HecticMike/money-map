export const BackToTopButton: React.FC = () => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 border border-brand-line bg-brand-highlight px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-midnight transition hover:bg-brand-amber"
    >
      ↑ Back to top
    </button>
  );
};

