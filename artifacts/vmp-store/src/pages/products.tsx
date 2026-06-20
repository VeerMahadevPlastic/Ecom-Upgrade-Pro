import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);

  const [searchQuery, setSearchQuery] = useState(params.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") ?? "");

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("search", searchQuery);
    if (selectedCategory) p.set("category", selectedCategory);
    setLocation(`/products${p.toString() ? "?" + p.toString() : ""}`, { replace: true });
  }, [searchQuery, selectedCategory]);

  const { data: productsData, isLoading } = useListProducts({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    limit: 200,
    offset: 0,
  });

  const { data: categoriesData } = useListCategories();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {selectedCategory
              ? categoriesData?.categories.find(c => c.slug === selectedCategory)?.name ?? "Products"
              : searchQuery
              ? `Results for "${searchQuery}"`
              : "All Products"}
          </h1>
          {productsData && (
            <p className="text-muted-foreground text-sm mt-1">
              {productsData.total} product{productsData.total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="bg-card border rounded-lg p-4 sticky top-20">
              <div className="flex items-center gap-2 font-semibold mb-4 text-sm">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </div>

              {/* Search within */}
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground block mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Name, SKU..."
                  className="w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Category filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Category</label>
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors mb-1 ${
                    !selectedCategory ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"
                  }`}
                >
                  All Categories
                </button>
                {categoriesData?.categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors mb-1 flex justify-between items-center ${
                      selectedCategory === cat.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"
                    }`}
                  >
                    <span className="line-clamp-1">{cat.name}</span>
                    <span className={`text-xs shrink-0 ml-1 ${selectedCategory === cat.slug ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {cat.productCount}
                    </span>
                  </button>
                ))}
              </div>

              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => { setSearchQuery(""); setSelectedCategory(""); }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            ) : productsData && productsData.products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsData.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
