// hooks/useSupabaseOptions.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Option = { value: string; label: string; id?: number };

export const useRelatedOptions = (table: string, isOpen: boolean) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;

        setOptions(data?.map(item => ({ 
          value: item.name, 
          label: item.name, 
          id: item.id 
        })) || []);
      } catch (error) {
        console.error(`Error fetching ${table} options:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [isOpen, table]);

  return { options, loading };
};

export const useUniqueFieldOptions = (table: string, field: string, isOpen: boolean) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(table)
          .select(field)
          .not(field, 'is', null)
          .order(field, { ascending: true });

        if (error) throw error;

        const uniqueValues = [...new Set(data?.map(item => item[field]))];
        setOptions(uniqueValues?.map(value => ({ 
          value: value?.toString() || '', 
          label: value?.toString() || '' 
        })) || []);
      } catch (error) {
        console.error(`Error fetching ${field} options:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [isOpen, table, field]);

  return { options, loading };
};