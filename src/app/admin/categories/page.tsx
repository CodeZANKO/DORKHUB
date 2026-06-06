"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { Layers, Plus, Trash2, Tag, Terminal, Edit2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ICON_MAP } from "@/lib/category-metadata";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  }>({ name: '', slug: '', description: '', icon: 'Terminal' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error("Failed to fetch categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const { error } = await supabase
      .from('categories')
      .insert([newCategory]);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Category added successfully");
      setNewCategory({ name: '', slug: '', description: '', icon: 'Terminal' });
      await fetchCategories();
    }
    setIsAdding(false);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('categories')
      .update({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description,
        icon: editingCategory.icon
      })
      .eq('id', editingCategory.id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Category updated successfully");
      setEditingCategory(null);
      await fetchCategories();
    }
    setIsUpdating(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will affect all dorks in this category.")) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Category deleted");
      await fetchCategories();
    }
  };

  return (
    <div className="p-8 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Layers className="text-purple-500 w-8 h-8" />
            Category <span className="text-purple-500">Registry</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">
            Configure search signature classifications and data taxonomy.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-card/40 border-white/5 backdrop-blur-xl h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              New Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input 
                  placeholder="e.g. Sensitive Files" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  required
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug (Auto-generated)</Label>
                <Input 
                  placeholder="sensitive-files" 
                  value={newCategory.slug}
                  onChange={e => setNewCategory({...newCategory, slug: e.target.value})}
                  required
                  className="bg-black/40 border-white/5 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                <Input 
                  placeholder="What kind of dorks belong here?" 
                  value={newCategory.description || ''}
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Icon</Label>
                <Select 
                  value={newCategory.icon || 'Terminal'} 
                  onValueChange={val => setNewCategory(prev => ({...prev, icon: val}))}
                >
                  <SelectTrigger className="bg-black/40 border-white/5">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 max-h-60">
                    {Object.keys(ICON_MAP).sort().map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName} className="hover:bg-white/5 focus:bg-white/5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest italic"
                disabled={isAdding}
              >
                {isAdding ? "Registering..." : "Initialize Category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5 backdrop-blur-xl lg:col-span-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Classification</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Slug</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest">
                      Mapping Taxonomy...
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => {
                    const Icon = (cat.icon && ICON_MAP[cat.icon]) || Terminal;
                    return (
                      <TableRow key={cat.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                              <Icon className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{cat.name}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{cat.description}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          /{cat.slug}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10"
                              onClick={() => setEditingCategory(cat)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white font-mono">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic text-purple-500 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Classification
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs uppercase font-bold tracking-widest">
              Modify existing category metadata.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleUpdateCategory} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input 
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  required
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug</Label>
                <Input 
                  value={editingCategory.slug}
                  onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})}
                  required
                  className="bg-black/40 border-white/5 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                <Input 
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Icon</Label>
                <Select 
                  value={editingCategory.icon || 'Terminal'} 
                  onValueChange={val => setEditingCategory(prev => prev ? {...prev, icon: val} : null)}
                >
                  <SelectTrigger className="bg-black/40 border-white/5 text-white">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 max-h-60">
                    {Object.keys(ICON_MAP).sort().map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName} className="text-white hover:bg-white/5 focus:bg-white/5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest italic"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
