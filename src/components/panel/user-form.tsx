import { ActionForm } from "./action-form";
import { saveUser } from "@/server/actions/admin";
export function UserForm({
  user,
  areas,
}: {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    areas: { areaId: string; isManager: boolean }[];
  };
  areas: { id: string; name: string }[];
}) {
  return (
    <ActionForm action={saveUser}>
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="two-columns">
        <label>
          Nombre
          <input
            name="name"
            defaultValue={user?.name}
            required
            maxLength={100}
          />
        </label>
        <label>
          Correo
          <input
            type="email"
            name="email"
            defaultValue={user?.email}
            required
            maxLength={254}
          />
        </label>
      </div>
      <label>
        Rol
        <select name="role" defaultValue={user?.role || "EDITOR"}>
          <option value="EDITOR">Editor</option>
          <option value="AREA_ADMIN">Administrador de área</option>
          <option value="INTERNAL">Usuario interno</option>
          <option value="SUPER_ADMIN">Super administrador</option>
        </select>
      </label>
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user?.isActive ?? true}
        />
        Usuario activo
      </label>
      <fieldset>
        <legend>Áreas y responsabilidades</legend>
        {areas.map((area) => (
          <div className="stack credential" key={area.id}>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="areaIds"
                value={area.id}
                defaultChecked={user?.areas.some((a) => a.areaId === area.id)}
              />
              {area.name}
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="managerIds"
                value={area.id}
                defaultChecked={user?.areas.some(
                  (a) => a.areaId === area.id && a.isManager,
                )}
              />
              Responsable de esta área
            </label>
          </div>
        ))}
      </fieldset>
      {!user && (
        <p className="notice">
          Se generará una contraseña temporal y se exigirá cambiarla en el
          primer ingreso.
        </p>
      )}
    </ActionForm>
  );
}
