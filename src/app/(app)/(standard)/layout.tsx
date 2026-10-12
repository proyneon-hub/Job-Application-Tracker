/** Most app pages use a comfortable reading width. The board sits outside this group to use the full screen. */
export default function StandardWidthLayout({ children }: LayoutProps<"/">) {
  return <div className="mx-auto w-full max-w-6xl">{children}</div>;
}
