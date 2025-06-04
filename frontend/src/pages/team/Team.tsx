import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useTeamStore } from "../../stores/teamStore";
import { useTaskStore } from "../../stores/taskStore";
import TeamMemberCard from "../../components/team/TeamMemberCard";
import { Users } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const Team = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { team, addTeamMember } = useTeamStore();
  const { tasks } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    temporaryPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only admin can access team page
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addTeamMember(form);
      setShowModal(false);
      setForm({ name: "", email: "", temporaryPassword: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add team member");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your field team members
          </p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => setShowModal(true)} variant="primary">
            Add Team Member
          </Button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                fullWidth
                className="p-2"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                required
                fullWidth
                className="p-2"
              />
              <Input
                label="Temporary Password"
                name="temporaryPassword"
                type="text"
                value={form.temporaryPassword}
                onChange={handleInputChange}
                required
                fullWidth
                hint="This password will be required for the new user to log in the first time."
                className="p-2"
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {team.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No team members
          </h3>
          <p className="mt-1 text-sm text-gray-500">Your team list is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <TeamMemberCard key={member.id} member={member} tasks={tasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Team;
