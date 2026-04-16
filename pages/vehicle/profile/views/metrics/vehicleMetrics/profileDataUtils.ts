export const extractMetricProfilesFromListResponse = (profilesData: any): any[] => {
  if (Array.isArray(profilesData?.data?.data)) return profilesData.data.data;
  if (Array.isArray(profilesData?.data?.metricProfiles)) return profilesData.data.metricProfiles;
  if (Array.isArray(profilesData?.metricProfiles)) return profilesData.metricProfiles;
  if (Array.isArray(profilesData?.data)) return profilesData.data;
  return [];
};

export const extractUsersFromListResponse = (usersData: any): any[] => {
  if (Array.isArray(usersData?.data?.users)) return usersData.data.users;
  if (Array.isArray(usersData?.data?.data)) return usersData.data.data;
  if (Array.isArray(usersData?.users)) return usersData.users;
  if (Array.isArray(usersData?.data)) return usersData.data;
  return [];
};

export const extractEcuIdsFromProfileMetrics = (profile: any): string[] => {
  const metrics = Array.isArray(profile?.metrics) ? profile.metrics : [];
  return Array.from(
    new Set<string>(
      metrics
        .map((metric: any) => metric?.ecu?.orion_id ?? metric?.group_ecu_orion_id ?? null)
        .filter(
          (ecuOrionId: any): ecuOrionId is string | number =>
            ecuOrionId !== null && ecuOrionId !== undefined
        )
        .map((ecuOrionId: any) => String(ecuOrionId))
    )
  );
};
