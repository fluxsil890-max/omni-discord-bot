import { DiscordEvent } from "./interfaces/event";
import { createModuleLogger } from "../services/logger";
import { db } from "../database/client";

const log = createModuleLogger("Event:GuildMemberUpdate");

export const guildMemberUpdate: DiscordEvent<"guildMemberUpdate"> = {
  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {
    try {
      if (!newMember.guild.id) return;

      // Check for role additions/removals
      const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
      const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

      if (addedRoles.size > 0) {
        addedRoles.forEach(role => {
          db.auditLog.create({
            data: {
              guildId: newMember.guild.id,
              userId: "system",
              action: "role_added",
              target: newMember.id,
              targetType: "user",
              details: { roleId: role.id, roleName: role.name },
            },
          }).catch(() => {});
        });
      }

      if (removedRoles.size > 0) {
        removedRoles.forEach(role => {
          db.auditLog.create({
            data: {
              guildId: newMember.guild.id,
              userId: "system",
              action: "role_removed",
              target: newMember.id,
              targetType: "user",
              details: { roleId: role.id, roleName: role.name },
            },
          }).catch(() => {});
        });
      }

      log.debug(
        { userId: newMember.id, added: addedRoles.size, removed: removedRoles.size },
        "Member roles updated"
      );
    } catch (error) {
      log.error({ error }, "Error handling guild member update");
    }
  },

  module: "core",
  enabled: true,
};
