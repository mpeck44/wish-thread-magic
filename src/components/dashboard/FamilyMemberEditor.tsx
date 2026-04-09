import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save, X, Users } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  age: number | null;
  energy_level: string | null;
  special_interests: string[] | null;
  family_id: string;
  is_child: boolean | null;
}

interface FamilyMemberEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyMembers: FamilyMember[];
  familyId: string | null;
  onUpdate: () => void;
}

const FamilyMemberEditor = ({ open, onOpenChange, familyMembers, familyId, onUpdate }: FamilyMemberEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", energy_level: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", age: "", energy_level: "medium" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const startEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      age: member.age?.toString() || "",
      energy_level: member.energy_level || "medium",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", age: "", energy_level: "" });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    setSaving(true);
    try {
      const age = editForm.age ? parseInt(editForm.age) : null;
      const { error } = await supabase
        .from("family_members")
        .update({
          name: editForm.name.trim(),
          age,
          energy_level: editForm.energy_level,
          is_child: age !== null ? age < 18 : null,
        })
        .eq("id", editingId);

      if (error) throw error;
      toast({ title: "Member updated" });
      cancelEdit();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error updating member", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!familyId || !newForm.name.trim()) return;
    setSaving(true);
    try {
      const age = newForm.age ? parseInt(newForm.age) : null;
      const { error } = await supabase
        .from("family_members")
        .insert({
          family_id: familyId,
          name: newForm.name.trim(),
          age,
          energy_level: newForm.energy_level,
          is_child: age !== null ? age < 18 : null,
        });

      if (error) throw error;
      toast({ title: "Member added" });
      setAddingNew(false);
      setNewForm({ name: "", age: "", energy_level: "medium" });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error adding member", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("family_members").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Member removed" });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const MemberForm = ({
    form,
    setForm,
    onSave,
    onCancel,
  }: {
    form: { name: string; age: string; energy_level: string };
    setForm: (f: typeof form) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <Card className="p-4 space-y-3 border-primary/30">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Member name"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Age</Label>
          <Input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Age"
            min={0}
            max={120}
          />
        </div>
        <div className="space-y-2">
          <Label>Energy Level</Label>
          <Select value={form.energy_level} onValueChange={(v) => setForm({ ...form, energy_level: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving || !form.name.trim()}>
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manage Family Members
          </DialogTitle>
          <DialogDescription>Add, edit, or remove family members</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {familyMembers.map((member) =>
            editingId === member.id ? (
              <MemberForm
                key={member.id}
                form={editForm}
                setForm={setEditForm}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.age ? `${member.age} yrs` : "Age not set"}
                      {member.energy_level && ` • ${member.energy_level}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(member)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteMember(member.id)}
                    disabled={saving}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          )}

          {addingNew ? (
            <MemberForm
              form={newForm}
              setForm={setNewForm}
              onSave={addMember}
              onCancel={() => {
                setAddingNew(false);
                setNewForm({ name: "", age: "", energy_level: "medium" });
              }}
            />
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAddingNew(true)}
              disabled={!familyId}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyMemberEditor;
