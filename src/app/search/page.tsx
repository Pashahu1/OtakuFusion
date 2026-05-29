import { SearchInput } from './_components/SearchInput';
import { SearchData } from './_components/SearchData';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword = '' } = await searchParams;

  return (
    <div className="flex flex-col">
      <SearchInput initialValue={keyword} />

      <SearchData keyword={keyword} />
    </div>
  );
}
