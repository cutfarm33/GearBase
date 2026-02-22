
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVertical } from '../hooks/useVertical';
import { getCategoriesForVertical, getVerticalConfig } from '../lib/verticalConfig';
import { InventoryItem, ItemStatus, ItemCondition } from '../types';
import { LayoutGrid, List, Plus, Upload, Trash2, CheckSquare, Square, Edit2, FolderDown as ExportIcon, ChevronDown, FileSpreadsheet, FileText, FileImage, FolderDown, QrCode, User, Package } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  // Strict check for checked out status
  const isUnavailable = status === ItemStatus.CHECKED_OUT || status === ItemStatus.UNAVAILABLE;

  // ALWAYS display "UNAVAILABLE" if checked out
  const label = isUnavailable ? 'UNAVAILABLE' : status;

  const colorClasses = {
    [ItemStatus.AVAILABLE]: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 border-2 font-bold',
    // Unified Red Style for Unavailable
    'UNAVAILABLE': 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 border-2 font-bold',
    [ItemStatus.IN_MAINTENANCE]: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 border-2 font-bold',
  };

  const styleKey = isUnavailable ? 'UNAVAILABLE' : (colorClasses[status] ? status : ItemStatus.AVAILABLE);

  return <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${colorClasses[styleKey]}`}>{label}</span>;
};


const InventoryScreen: React.FC = () => {
  const { state, navigateTo, supabase, refreshData, dispatch, deleteInventoryItem, updateInventoryItem, findUser } = useAppContext();

  // Helper to get who has an item checked out
  const getCheckedOutTo = (item: InventoryItem): string | null => {
      if (item.status !== ItemStatus.CHECKED_OUT || !item.history || item.history.length === 0) return null;
      const lastCheckout = item.history[0];
      // Prefer the free-text name, fall back to user lookup
      return lastCheckout.assignedToName || (lastCheckout.assignedToId ? findUser(lastCheckout.assignedToId)?.name : null) || (findUser(lastCheckout.userId)?.name) || null;
  };
  const { vertical } = useVertical();
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single Delete State
  const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);

  // Inline Edit State
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Download Dropdown State
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showCategorySubmenu, setShowCategorySubmenu] = useState(false);

  // Load More State
  const [visibleCount, setVisibleCount] = useState(20);

  // Get vertical-specific categories plus any custom ones from database
  const verticalCategories = getCategoriesForVertical(vertical);
  const categories = ['All', ...Array.from(new Set([
      ...verticalCategories,
      ...state.inventory.map(i => i.category)
  ])).sort()];

  const filteredInventory = state.inventory.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(filter.toLowerCase());
      const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
      return nameMatch && categoryMatch;
  });

  // Load More Logic
  const displayedInventory = filteredInventory.slice(0, visibleCount);
  const hasMore = visibleCount < filteredInventory.length;

  // Reset visible count when filters change
  React.useEffect(() => {
      setVisibleCount(20);
  }, [filter, categoryFilter]);

  // Selection Logic
  const allSelected = filteredInventory.length > 0 && filteredInventory.every(i => selectedIds.has(i.id));

  const toggleSelectAll = () => {
      const newSet = new Set(selectedIds);
      if (allSelected) {
          filteredInventory.forEach(i => newSet.delete(i.id));
      } else {
          filteredInventory.forEach(i => newSet.add(i.id));
      }
      setSelectedIds(newSet);
  };

  const toggleSelection = (id: number) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const confirmDelete = (e: React.MouseEvent, item: InventoryItem) => {
      e.stopPropagation();
      setItemToDelete({ id: item.id, name: item.name });
  };

  const handleDelete = async () => {
      if (itemToDelete) {
          await deleteInventoryItem(itemToDelete.id);
          setItemToDelete(null);
      }
  };

  const handleBulkDelete = async () => {
      setIsBulkDeleting(true);
      try {
          const ids = Array.from(selectedIds);
          
          await supabase.from('job_items').delete().in('item_id', ids);
          await supabase.from('transaction_items').delete().in('item_id', ids);
          await supabase.from('kit_items').delete().in('item_id', ids);
          
          const { error } = await supabase.from('inventory').delete().in('id', ids);
          
          if (error) throw error;

          ids.forEach(id => dispatch({ type: 'DELETE_INVENTORY_ITEM_LOCAL', payload: id }));
          
          setSelectedIds(new Set());
          setShowBulkDeleteModal(false);
          await refreshData(true);
          
      } catch (err: any) {
          console.error("Bulk delete failed:", err);
          alert("Bulk delete failed: " + err.message);
      } finally {
          setIsBulkDeleting(false);
      }
  };

  const handleCategoryChange = async (item: InventoryItem, newCategory: string) => {
      setEditingCategoryId(null); // Close dropdown
      if (item.category === newCategory) return;

      const updatedItem = { ...item, category: newCategory };
      await updateInventoryItem(updatedItem);
  };

  // Helper to escape CSV values
  const escapeCSV = (value: string | number | undefined | null): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
  };

  // Download formatted inventory report (all details, human-readable)
  const downloadFormattedReport = () => {
      const items = filteredInventory.length > 0 ? filteredInventory : state.inventory;
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Group items by category for better organization
      const byCategory: Record<string, InventoryItem[]> = {};
      items.forEach(item => {
          if (!byCategory[item.category]) byCategory[item.category] = [];
          byCategory[item.category].push(item);
      });

      // Build CSV with headers and summary
      let csv = `GEAR BASE INVENTORY REPORT\n`;
      csv += `Generated: ${date}\n`;
      csv += `Total Items: ${items.length}\n`;
      csv += `Available: ${items.filter(i => i.status === ItemStatus.AVAILABLE).length}\n`;
      csv += `Checked Out: ${items.filter(i => i.status === ItemStatus.CHECKED_OUT).length}\n\n`;

      // Calculate total value
      const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);
      csv += `Total Inventory Value: $${totalValue.toLocaleString()}\n\n`;

      csv += `Name,Category,QR Code,Status,Condition,Value,Weight (lbs),Storage Case,Purchase Date,Notes\n`;

      // Sort categories and items within categories
      Object.keys(byCategory).sort().forEach(category => {
          byCategory[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
              csv += [
                  escapeCSV(item.name),
                  escapeCSV(item.category),
                  escapeCSV(item.qrCode),
                  escapeCSV(item.status),
                  escapeCSV(item.condition),
                  item.value ? `$${item.value}` : '',
                  item.weight || '',
                  escapeCSV(item.storageCase || ''),
                  item.purchaseDate || '',
                  escapeCSV(item.notes || '')
              ].join(',') + '\n';
          });
      });

      // Download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowDownloadMenu(false);
  };

  // Download import-ready CSV (matches GearBase import format)
  const downloadImportCSV = () => {
      const items = filteredInventory.length > 0 ? filteredInventory : state.inventory;

      // Add metadata header with vertical type for import detection
      const verticalConfig = getVerticalConfig(vertical);
      let csv = `# GearBase Export - Template: ${verticalConfig.name}\n`;
      csv += `# Exported: ${new Date().toLocaleDateString()}\n`;

      // Format: Name, Category, Value, QR Code, Image URL, Notes (matches import template)
      csv += `Name,Category,Value,QR Code,Image URL,Notes\n`;

      items.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
          csv += [
              escapeCSV(item.name),
              escapeCSV(item.category),
              item.value || '',
              escapeCSV(item.qrCode),
              escapeCSV(item.imageUrl || ''),
              escapeCSV(item.notes || '')
          ].join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_transfer_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowDownloadMenu(false);
  };

  // Download PDF inventory report
  const downloadPDF = (categoryToExport?: string) => {
      const items = categoryToExport
          ? state.inventory.filter(i => i.category === categoryToExport)
          : (filteredInventory.length > 0 ? filteredInventory : state.inventory);

      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const doc = new jsPDF();

      // Title
      const title = categoryToExport ? `${categoryToExport} Inventory` : 'Inventory Report';
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(title, 14, 20);

      // Subtitle with date
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate color
      doc.text(`Generated: ${date}`, 14, 28);

      // Summary stats
      const available = items.filter(i => i.status === ItemStatus.AVAILABLE).length;
      const checkedOut = items.filter(i => i.status === ItemStatus.CHECKED_OUT).length;
      const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);

      doc.setFontSize(9);
      doc.text(`Total Items: ${items.length}  |  Available: ${available}  |  Checked Out: ${checkedOut}  |  Total Value: $${totalValue.toLocaleString()}`, 14, 35);

      // Group by category
      const byCategory: Record<string, InventoryItem[]> = {};
      items.forEach(item => {
          if (!byCategory[item.category]) byCategory[item.category] = [];
          byCategory[item.category].push(item);
      });

      let yPosition = 45;

      Object.keys(byCategory).sort().forEach(category => {
          const categoryItems = byCategory[category].sort((a, b) => a.name.localeCompare(b.name));

          // Category header
          doc.setFontSize(12);
          doc.setTextColor(30, 41, 59); // Slate-800
          doc.text(`${category} (${categoryItems.length})`, 14, yPosition);
          yPosition += 2;

          // Table for this category
          autoTable(doc, {
              startY: yPosition,
              head: [['Name', 'QR Code', 'Status', 'Condition', 'Value']],
              body: categoryItems.map(item => [
                  item.name,
                  item.qrCode,
                  item.status === ItemStatus.CHECKED_OUT ? 'Checked Out' : item.status,
                  item.condition,
                  item.value ? `$${item.value.toLocaleString()}` : '-'
              ]),
              theme: 'striped',
              headStyles: {
                  fillColor: [16, 185, 129], // Emerald
                  fontSize: 8,
                  fontStyle: 'bold'
              },
              bodyStyles: { fontSize: 8 },
              columnStyles: {
                  0: { cellWidth: 60 },
                  1: { cellWidth: 30 },
                  2: { cellWidth: 30 },
                  3: { cellWidth: 30 },
                  4: { cellWidth: 25 }
              },
              margin: { left: 14, right: 14 }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;

          // Add new page if needed
          if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
          }
      });

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Gear Base - Page ${i} of ${pageCount}`, 14, 290);
      }

      const filename = categoryToExport
          ? `inventory_${categoryToExport.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          : `inventory_report_${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(filename);
      setShowDownloadMenu(false);
      setShowCategorySubmenu(false);
  };

  // Download CSV for specific category
  const downloadCategoryCSV = (category: string) => {
      const items = state.inventory.filter(i => i.category === category);

      let csv = `Name,Category,Value,QR Code,Status,Condition,Notes\n`;

      items.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
          csv += [
              escapeCSV(item.name),
              escapeCSV(item.category),
              item.value || '',
              escapeCSV(item.qrCode),
              escapeCSV(item.status),
              escapeCSV(item.condition),
              escapeCSV(item.notes || '')
          ].join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_inventory_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowDownloadMenu(false);
      setShowCategorySubmenu(false);
  };

  // Generate QR Code Labels PDF (printable stickers - 0.5" x 0.5" QR codes)
  const downloadQRLabels = async (categoryToExport?: string) => {
      const items = categoryToExport
          ? state.inventory.filter(i => i.category === categoryToExport)
          : (filteredInventory.length > 0 ? filteredInventory : state.inventory);

      const doc = new jsPDF();
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      // Label layout settings (3 columns x 4 rows per page = 12 labels per page)
      const labelsPerRow = 3;
      const labelsPerColumn = 4;
      const labelsPerPage = labelsPerRow * labelsPerColumn;

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 10;
      const marginY = 15;

      const labelWidth = (pageWidth - 2 * marginX) / labelsPerRow;
      const labelHeight = (pageHeight - 2 * marginY - 10) / labelsPerColumn;

      // QR code size: 0.5" x 0.5" = 12.7mm
      const qrSize = 12.7;

      // Sort items by category then name
      const sortedItems = [...items].sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return a.name.localeCompare(b.name);
      });

      // Generate QR codes for all items
      const qrCodes: { [key: string]: string } = {};
      for (const item of sortedItems) {
          try {
              qrCodes[item.qrCode] = await QRCode.toDataURL(item.qrCode, {
                  width: 150,
                  margin: 1,
                  color: { dark: '#000000', light: '#ffffff' }
              });
          } catch (err) {
              console.error('Error generating QR code for:', item.name, err);
          }
      }

      // Generate pages
      let currentPage = 0;
      for (let i = 0; i < sortedItems.length; i++) {
          const pageIndex = Math.floor(i / labelsPerPage);
          const positionOnPage = i % labelsPerPage;

          // Add new page if needed
          if (pageIndex > currentPage) {
              doc.addPage();
              currentPage = pageIndex;
          }

          // Calculate position
          const col = positionOnPage % labelsPerRow;
          const row = Math.floor(positionOnPage / labelsPerRow);
          const x = marginX + col * labelWidth;
          const y = marginY + 8 + row * labelHeight;

          // Page header on first row
          if (positionOnPage === 0) {
              doc.setFontSize(10);
              doc.setTextColor(100, 116, 139);
              const title = categoryToExport ? `${categoryToExport} QR Labels` : 'Inventory QR Labels';
              doc.text(title, marginX, marginY);
              doc.text(`Generated: ${date}`, pageWidth - marginX - 50, marginY);
          }

          const item = sortedItems[i];
          const qrDataUrl = qrCodes[item.qrCode];

          // Draw label border (dashed for cutting guide)
          doc.setDrawColor(200, 200, 200);
          doc.setLineDashPattern([2, 2], 0);
          doc.rect(x + 2, y, labelWidth - 4, labelHeight - 4);
          doc.setLineDashPattern([], 0);

          // QR Code (0.5" x 0.5" = 12.7mm, centered in label)
          const qrX = x + (labelWidth - qrSize) / 2;
          const qrY = y + 3;

          if (qrDataUrl) {
              doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          }

          // Item name (below QR code, truncated if needed)
          doc.setFontSize(7);
          doc.setTextColor(30, 41, 59);
          const maxNameWidth = labelWidth - 8;
          let displayName = item.name;
          while (doc.getTextWidth(displayName) > maxNameWidth && displayName.length > 3) {
              displayName = displayName.slice(0, -4) + '...';
          }
          doc.text(displayName, x + labelWidth / 2, y + qrSize + 7, { align: 'center' });

          // QR code value (smaller, below name)
          doc.setFontSize(5);
          doc.setTextColor(100, 116, 139);
          doc.text(item.qrCode, x + labelWidth / 2, y + qrSize + 11, { align: 'center' });

          // Category (tiny, at bottom)
          doc.setFontSize(4);
          doc.setTextColor(148, 163, 184);
          doc.text(item.category, x + labelWidth / 2, y + qrSize + 14, { align: 'center' });
      }

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Gear Base - Page ${i} of ${pageCount} - ${sortedItems.length} labels`, marginX, pageHeight - 5);
      }

      const filename = categoryToExport
          ? `qr_labels_${categoryToExport.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          : `qr_labels_${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(filename);
      setShowDownloadMenu(false);
      setShowCategorySubmenu(false);
  };

  // Helper function to load image as base64 with dimensions
  const loadImageAsBase64 = async (url: string): Promise<{ data: string; width: number; height: number } | null> => {
      console.log('Loading image:', url);

      // First try with fetch, then load into Image to get dimensions
      try {
          const response = await fetch(url);
          if (response.ok) {
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
              });

              // Load into Image to get dimensions
              return new Promise((resolve) => {
                  const img = new Image();
                  img.onload = () => {
                      console.log('Image loaded via fetch:', url.substring(0, 50), img.width, 'x', img.height);
                      resolve({ data: base64, width: img.width, height: img.height });
                  };
                  img.onerror = () => resolve(null);
                  img.src = base64;
              });
          }
      } catch (fetchErr) {
          console.log('Fetch failed, trying Image element:', fetchErr);
      }

      // Fallback to Image element
      return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
              try {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      ctx.drawImage(img, 0, 0);
                      const result = canvas.toDataURL('image/jpeg', 0.8);
                      console.log('Image loaded via canvas:', url.substring(0, 50), img.width, 'x', img.height);
                      resolve({ data: result, width: img.width, height: img.height });
                  } else {
                      resolve(null);
                  }
              } catch (err) {
                  console.error('Canvas error:', err);
                  resolve(null);
              }
          };

          img.onerror = (err) => {
              console.error('Image load error:', url, err);
              resolve(null);
          };

          img.src = url;
      });
  };

  // Download Catalog PDF with images
  const downloadCatalogPDF = async (categoryToExport?: string) => {
      const items = categoryToExport
          ? state.inventory.filter(i => i.category === categoryToExport)
          : (filteredInventory.length > 0 ? filteredInventory : state.inventory);

      if (items.length === 0) {
          alert('No items to export');
          return;
      }

      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const doc = new jsPDF();

      // Layout settings: 2 columns x 3 rows = 6 items per page
      const cols = 2;
      const rows = 3;
      const itemsPerPage = cols * rows;

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 12;
      const marginY = 20;
      const headerHeight = 15;

      const cardWidth = (pageWidth - 2 * marginX - 10) / cols;
      const cardHeight = (pageHeight - marginY - headerHeight - 15) / rows;
      const cardPadding = 5;
      const imageHeight = cardHeight - 35; // Leave space for text

      // Sort items by category then name
      const sortedItems = [...items].sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return a.name.localeCompare(b.name);
      });

      // Pre-load all images and QR codes
      const imageCache: { [key: number]: { data: string; width: number; height: number } | null } = {};
      const qrCache: { [key: string]: string } = {};

      // Show loading state (update button text temporarily)
      setShowDownloadMenu(false);

      for (const item of sortedItems) {
          // Load item image
          if (item.imageUrl) {
              imageCache[item.id] = await loadImageAsBase64(item.imageUrl);
          }
          // Generate QR code
          try {
              qrCache[item.qrCode] = await QRCode.toDataURL(item.qrCode, {
                  width: 80,
                  margin: 1,
                  color: { dark: '#000000', light: '#ffffff' }
              });
          } catch (err) {
              console.error('Error generating QR code:', err);
          }
      }

      // Calculate total value
      const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);
      const available = items.filter(i => i.status === ItemStatus.AVAILABLE).length;

      // Generate pages
      const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

      for (let page = 0; page < totalPages; page++) {
          if (page > 0) doc.addPage();

          // Header
          doc.setFontSize(16);
          doc.setTextColor(16, 185, 129);
          const title = categoryToExport ? `${categoryToExport} Catalog` : 'Inventory Catalog';
          doc.text(title, marginX, marginY);

          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`Generated: ${date}  |  ${items.length} items  |  ${available} available  |  Total: $${totalValue.toLocaleString()}`, marginX, marginY + 7);

          // Draw cards for this page
          const startIndex = page * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, sortedItems.length);

          for (let i = startIndex; i < endIndex; i++) {
              const item = sortedItems[i];
              const positionOnPage = i - startIndex;
              const col = positionOnPage % cols;
              const row = Math.floor(positionOnPage / cols);

              const x = marginX + col * (cardWidth + 5);
              const y = marginY + headerHeight + row * cardHeight;

              // Card background
              doc.setFillColor(248, 250, 252); // slate-50
              doc.setDrawColor(226, 232, 240); // slate-200
              doc.roundedRect(x, y, cardWidth, cardHeight - 3, 3, 3, 'FD');

              // Item image
              const imageInfo = imageCache[item.id];
              if (imageInfo) {
                  try {
                      // Calculate image dimensions to fit in card while maintaining aspect ratio
                      const maxWidth = cardWidth - 2 * cardPadding;
                      const maxHeight = imageHeight - cardPadding;
                      const aspectRatio = imageInfo.width / imageInfo.height;

                      let imgWidth = maxWidth;
                      let imgHeight = imgWidth / aspectRatio;

                      // If too tall, scale by height instead
                      if (imgHeight > maxHeight) {
                          imgHeight = maxHeight;
                          imgWidth = imgHeight * aspectRatio;
                      }

                      // Center the image horizontally in the card
                      const imgX = x + cardPadding + (maxWidth - imgWidth) / 2;

                      doc.addImage(imageInfo.data, 'JPEG', imgX, y + cardPadding, imgWidth, imgHeight);
                  } catch (err) {
                      // Draw placeholder if image fails
                      doc.setFillColor(203, 213, 225);
                      doc.rect(x + cardPadding, y + cardPadding, cardWidth - 2 * cardPadding, imageHeight - cardPadding, 'F');
                      doc.setFontSize(8);
                      doc.setTextColor(100, 116, 139);
                      doc.text('No Image', x + cardWidth / 2, y + imageHeight / 2, { align: 'center' });
                  }
              } else {
                  // Draw placeholder
                  doc.setFillColor(203, 213, 225);
                  doc.rect(x + cardPadding, y + cardPadding, cardWidth - 2 * cardPadding, imageHeight - cardPadding, 'F');
                  doc.setFontSize(8);
                  doc.setTextColor(100, 116, 139);
                  doc.text('No Image', x + cardWidth / 2, y + imageHeight / 2, { align: 'center' });
              }

              // Item name (bold, truncate if needed)
              doc.setFontSize(9);
              doc.setTextColor(30, 41, 59);
              doc.setFont('helvetica', 'bold');
              let displayName = item.name;
              const maxNameWidth = cardWidth - 35;
              while (doc.getTextWidth(displayName) > maxNameWidth && displayName.length > 5) {
                  displayName = displayName.slice(0, -4) + '...';
              }
              doc.text(displayName, x + cardPadding, y + imageHeight + 8);

              // Value
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(16, 185, 129);
              if (item.value) {
                  doc.text(`$${item.value.toLocaleString()}`, x + cardPadding, y + imageHeight + 15);
              }

              // Category
              doc.setFontSize(7);
              doc.setTextColor(100, 116, 139);
              doc.text(item.category, x + cardPadding, y + imageHeight + 21);

              // QR code (small, bottom right of card)
              const qrData = qrCache[item.qrCode];
              if (qrData) {
                  const qrSize = 18;
                  doc.addImage(qrData, 'PNG', x + cardWidth - qrSize - cardPadding, y + imageHeight + 2, qrSize, qrSize);
              }

              // QR code text (under QR)
              doc.setFontSize(5);
              doc.setTextColor(148, 163, 184);
              doc.text(item.qrCode, x + cardWidth - cardPadding - 9, y + imageHeight + 23, { align: 'center' });
          }
      }

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Gear Base - Page ${i} of ${pageCount}`, marginX, pageHeight - 8);
      }

      const filename = categoryToExport
          ? `catalog_${categoryToExport.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          : `inventory_catalog_${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(filename);
      setShowCategorySubmenu(false);
  };

  // Get categories that have items
  const categoriesWithItems = categories.filter(c => c !== 'All' && state.inventory.some(i => i.category === c));

  return (
    <div>
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title={`Delete ${selectedIds.size} Items`}
        message={`Are you sure you want to delete ${selectedIds.size} items? This cannot be undone.`}
        confirmText={isBulkDeleting ? "Deleting..." : "Delete All"}
        isDestructive={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Inventory</h2>
            {selectedIds.size > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-700">
                    {selectedIds.size} selected
                </span>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            <div className="flex gap-3 w-full sm:w-auto transition-all duration-300">
                {selectedIds.size > 0 ? (
                    <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 animate-in slide-in-from-right-5"
                    >
                        <Trash2 size={20} />
                        Delete {selectedIds.size} Items
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => navigateTo('ADD_ITEM')}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
                        >
                            <Plus size={20} />
                            Add Item
                        </button>
                        <button
                            onClick={() => navigateTo('IMPORT_INVENTORY')}
                            className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all flex items-center justify-center gap-2"
                            title="Bulk Import from CSV/Excel"
                        >
                            <Upload size={20} />
                            Import
                        </button>

                        {/* Download Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all flex items-center justify-center gap-2"
                                title="Export Inventory"
                            >
                                <ExportIcon size={20} />
                                Export
                                <ChevronDown size={16} className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showDownloadMenu && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => { setShowDownloadMenu(false); setShowCategorySubmenu(false); }}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 font-medium">Export Options</p>
                                        </div>

                                        {/* CSV Report */}
                                        <button
                                            onClick={downloadFormattedReport}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">CSV Report</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Spreadsheet with all details & summary</p>
                                            </div>
                                        </button>

                                        {/* Catalog PDF (with images) */}
                                        <button
                                            onClick={() => downloadCatalogPDF()}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
                                        >
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileImage size={20} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">Catalog PDF</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Visual grid with photos, QR codes & values</p>
                                            </div>
                                        </button>

                                        {/* PDF Report (table format) */}
                                        <button
                                            onClick={() => downloadPDF()}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
                                        >
                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText size={20} className="text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">PDF Report</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Table format grouped by category</p>
                                            </div>
                                        </button>

                                        {/* Transfer CSV */}
                                        <button
                                            onClick={downloadImportCSV}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileSpreadsheet size={20} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">Transfer CSV</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Import-ready format for another account</p>
                                            </div>
                                        </button>

                                        {/* QR Code Labels */}
                                        <button
                                            onClick={() => downloadQRLabels()}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
                                        >
                                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <QrCode size={20} className="text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">QR Code Labels</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Printable stickers with QR codes & names</p>
                                            </div>
                                        </button>

                                        {/* Export by Category */}
                                        <div className="relative border-t border-slate-100 dark:border-slate-700">
                                            <button
                                                onClick={() => setShowCategorySubmenu(!showCategorySubmenu)}
                                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FolderDown size={20} className="text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-900 dark:text-white">Export by Category</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Download individual categories</p>
                                                </div>
                                                <ChevronDown size={16} className={`text-slate-400 transition-transform mt-2 ${showCategorySubmenu ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showCategorySubmenu && (
                                                <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                                                    {categoriesWithItems.map(cat => (
                                                        <div key={cat} className="flex items-center border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                                            <button
                                                                onClick={() => downloadCategoryCSV(cat)}
                                                                className="flex-1 px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                <span className="font-medium">{cat}</span>
                                                                <span className="text-xs text-slate-400 ml-2">
                                                                    ({state.inventory.filter(i => i.category === cat).length})
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => downloadQRLabels(cat)}
                                                                className="px-2 py-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                                title={`Download ${cat} QR labels`}
                                                            >
                                                                <QrCode size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => downloadCatalogPDF(cat)}
                                                                className="px-2 py-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                                title={`Download ${cat} as catalog with images`}
                                                            >
                                                                <FileImage size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => downloadPDF(cat)}
                                                                className="px-2 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                title={`Download ${cat} as PDF table`}
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {filteredInventory.length > 0 && filteredInventory.length !== state.inventory.length && (
                                            <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
                                                <p className="text-xs text-amber-700 dark:text-amber-300 px-2">
                                                    Exporting {filteredInventory.length} filtered items
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto items-center">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full border border-slate-200 dark:border-slate-700"
                />
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        title="List View"
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Category Chips - Sticky */}
      <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-3 -mx-6 px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.filter(cat => cat === 'All' || state.inventory.some(i => i.category === cat)).map(cat => {
                  const count = cat === 'All' ? state.inventory.length : state.inventory.filter(i => i.category === cat).length;
                  return (
                      <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                              categoryFilter === cat
                                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                          }`}
                      >
                          {cat} <span className={`ml-1 ${categoryFilter === cat ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'}`}>({count})</span>
                      </button>
                  );
              })}
          </div>
      </div>

      {filteredInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Package size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {filter ? 'No items match your search' : `No items in ${categoryFilter}`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                  {filter ? 'Try adjusting your search term or clearing the filter.' : 'Add your first item to this category to get started.'}
              </p>
              <button
                  onClick={() => navigateTo('ADD_ITEM')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                  <Plus size={18} />
                  Add Item
              </button>
          </div>
      ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedInventory.map((item: InventoryItem) => {
                  const isUnavailable = item.status === ItemStatus.CHECKED_OUT || item.status === ItemStatus.UNAVAILABLE;
                  const checkedOutTo = getCheckedOutTo(item);
                  return (
                    <div key={item.id} onClick={() => navigateTo('ITEM_DETAIL', { itemId: item.id, from: 'INVENTORY' })} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-slate-100 dark:border-slate-700 relative">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />

                        <button
                            onClick={(e) => confirmDelete(e, item)}
                            className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 p-2.5 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 shadow-lg"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" title={item.name}>{item.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">{item.category}</p>
                            <div className="flex justify-between items-center">
                                <StatusBadge status={item.status} />
                                <span className={`text-xs font-semibold truncate ml-2 ${
                                    item.condition === ItemCondition.GOOD ? 'text-slate-500 dark:text-slate-400' :
                                    item.condition === ItemCondition.USED ? 'text-blue-600 dark:text-blue-400' :
                                    'text-amber-600 dark:text-amber-400'
                                }`}>{item.condition}</span>
                            </div>
                            {checkedOutTo && (
                                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                                    <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                        <User size={14} /> {checkedOutTo}
                                    </p>
                                </div>
                            )}
                        </div>
                        {isUnavailable && <div className="absolute inset-0 bg-red-500/5 pointer-events-none border-2 border-red-500/20 rounded-3xl"></div>}
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-10">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                    title="Select All"
                                >
                                    {allSelected ? <CheckSquare size={20} className="text-emerald-600 dark:text-emerald-400"/> : <Square size={20}/>}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Item</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">QR Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Checked Out To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Condition</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {displayedInventory.map((item: InventoryItem) => {
                            const isSelected = selectedIds.has(item.id);
                            const isEditingCategory = editingCategoryId === item.id;
                            const isUnavailable = item.status === ItemStatus.CHECKED_OUT || item.status === ItemStatus.UNAVAILABLE;
                            const checkedOutTo = getCheckedOutTo(item);

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => navigateTo('ITEM_DETAIL', { itemId: item.id, from: 'INVENTORY' })}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''} ${isUnavailable ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                            className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
                                        >
                                            {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded object-cover" src={item.imageUrl} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {isEditingCategory ? (
                                            <select 
                                                autoFocus
                                                className="bg-white dark:bg-slate-800 border border-sky-500 rounded px-2 py-1 outline-none"
                                                value={item.category}
                                                onChange={(e) => handleCategoryChange(item, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={() => setEditingCategoryId(null)}
                                            >
                                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <div 
                                                className="group/cat flex items-center gap-2 cursor-text hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); setEditingCategoryId(item.id); }}
                                                title="Click to change category"
                                            >
                                                {item.category}
                                                <Edit2 size={12} className="opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">{item.qrCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {checkedOutTo ? (
                                            <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <User size={14} /> {checkedOutTo}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`${
                                            item.condition === ItemCondition.GOOD ? 'text-slate-500 dark:text-slate-400' :
                                            item.condition === ItemCondition.USED ? 'text-blue-600 dark:text-blue-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={(e) => confirmDelete(e, item)}
                                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
          </div>
      )}

      {/* Load More */}
      {filteredInventory.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-semibold text-slate-900 dark:text-white">{Math.min(visibleCount, filteredInventory.length)}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{filteredInventory.length}</span> items
              </p>
              {hasMore && (
                  <button
                      onClick={() => setVisibleCount(v => v + 20)}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold py-3 px-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
                  >
                      Load More
                  </button>
              )}
          </div>
      )}
    </div>
  );
};

export default InventoryScreen;
