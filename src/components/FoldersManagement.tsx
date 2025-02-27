
import React, { useState, useEffect } from "react";
import {
  Folder,
  PlusCircle,
  Pencil,
  Trash2,
  Globe,
  Instagram,
  HardDrive,
  Image
} from "lucide-react";
import { useTask, Folder as FolderType } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Estendendo o tipo Folder para incluir os campos adicionais
interface ExtendedFolder extends FolderType {
  logo?: string;
  website?: string;
  instagram?: string;
  googleDrive?: string;
}

export function FoldersManagement() {
  const { currentWorkspace } = useWorkspace();
  const { folders, addFolder, updateFolder, deleteFolder, getTasksByFolder } = useTask();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ExtendedFolder | null>(null);
  const [newFolder, setNewFolder] = useState({
    name: "",
    logo: "",
    website: "",
    instagram: "",
    googleDrive: ""
  });
  
  const workspaceFolders = folders.filter(
    folder => currentWorkspace && folder.workspaceId === currentWorkspace.id
  ) as ExtendedFolder[];
  
  const resetForm = () => {
    setNewFolder({
      name: "",
      logo: "",
      website: "",
      instagram: "",
      googleDrive: ""
    });
    setEditingFolder(null);
  };
  
  const handleOpenDialog = (folder?: ExtendedFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setNewFolder({
        name: folder.name,
        logo: folder.logo || "",
        website: folder.website || "",
        instagram: folder.instagram || "",
        googleDrive: folder.googleDrive || ""
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveFolder = () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da pasta é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingFolder) {
        // Atualizar pasta existente
        updateFolder(editingFolder.id, {
          name: newFolder.name,
          // Precisamos fazer um cast aqui para adicionar os campos personalizados
          ...(newFolder as any)
        });
        
        toast({
          title: "Sucesso",
          description: "Pasta atualizada com sucesso",
        });
      } else if (currentWorkspace) {
        // Criar nova pasta
        addFolder({
          name: newFolder.name,
          workspaceId: currentWorkspace.id,
          color: "#808080",
          icon: "folder",
          // Adicionar campos personalizados
          ...(newFolder as any)
        });
        
        toast({
          title: "Sucesso",
          description: "Pasta criada com sucesso",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar pasta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a pasta",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteFolder = (folderId: string) => {
    try {
      const tasksInFolder = getTasksByFolder(folderId);
      
      if (tasksInFolder.length > 0) {
        if (!window.confirm(`Esta pasta contém ${tasksInFolder.length} tarefa(s). Deseja realmente excluí-la? As tarefas serão movidas para 'Sem pasta'.`)) {
          return;
        }
      }
      
      deleteFolder(folderId);
      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir pasta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a pasta",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pastas</h1>
          <p className="text-muted-foreground">
            Gerenciamento de pastas e clientes
          </p>
        </div>
        <Button className="gap-1" onClick={() => handleOpenDialog()}>
          <PlusCircle className="h-4 w-4" />
          Nova Pasta
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceFolders.length > 0 ? (
          workspaceFolders.map((folder) => (
            <Card key={folder.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-blue-500" />
                    <span>{folder.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(folder)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteFolder(folder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {folder.logo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Image className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Logo:</span>
                    <span className="text-muted-foreground truncate">
                      {folder.logo}
                    </span>
                  </div>
                )}
                
                {folder.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Website:</span>
                    <a 
                      href={folder.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {folder.website}
                    </a>
                  </div>
                )}
                
                {folder.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Instagram:</span>
                    <a 
                      href={`https://instagram.com/${folder.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {folder.instagram}
                    </a>
                  </div>
                )}
                
                {folder.googleDrive && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Google Drive:</span>
                    <a 
                      href={folder.googleDrive} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      Ver arquivos
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Nenhuma pasta encontrada. Crie uma nova pasta para começar.</p>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? "Editar pasta" : "Nova pasta"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome *</Label>
              <Input
                id="folder-name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Nome da pasta ou cliente"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-logo">Logotipo (URL)</Label>
              <Input
                id="folder-logo"
                value={newFolder.logo}
                onChange={(e) => setNewFolder({ ...newFolder, logo: e.target.value })}
                placeholder="URL da imagem do logotipo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-website">Website</Label>
              <Input
                id="folder-website"
                value={newFolder.website}
                onChange={(e) => setNewFolder({ ...newFolder, website: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-instagram">Instagram</Label>
              <Input
                id="folder-instagram"
                value={newFolder.instagram}
                onChange={(e) => setNewFolder({ ...newFolder, instagram: e.target.value })}
                placeholder="@usuario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-drive">Google Drive</Label>
              <Input
                id="folder-drive"
                value={newFolder.googleDrive}
                onChange={(e) => setNewFolder({ ...newFolder, googleDrive: e.target.value })}
                placeholder="URL do Google Drive"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveFolder}>
              {editingFolder ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
