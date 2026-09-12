<script setup>
const { data: projects } = await useAsyncData('projects', () =>
  queryContent('project').sort({ createdAt: -1 }).find(),
);
const { projectOverrides } = useSiteContent();

const visibleProjects = computed(() => {
  const baseProjects = (projects.value || []).map((project) => {
    const override = projectOverrides.value.find(
      (item) => item._path === project._path,
    );
    return override ? { ...project, ...override } : project;
  });

  const customProjects = projectOverrides.value.filter(
    (item) =>
      item.isNew &&
      !baseProjects.some((project) => project._path === item._path),
  );

  return [...baseProjects, ...customProjects].filter(
    (project) => !project.hidden,
  );
});
</script>

<template>
  <section class="projects" data-scroll-section>
    <VH2 class="projects__title">Çalışmalar</VH2>

    <ul class="projects__list">
      <VProjectsItem
        v-for="(project, key) in visibleProjects"
        :id="key"
        :key="key"
        :project="project"
        :aria-label="project.title"
        class="projects__list__item"
      />
    </ul>
  </section>
</template>

<style lang="scss">
.projects {
  color: var(--ff-color);

  padding: 4rem clamp(1rem, 7vw, 5rem) clamp(6rem, 10vw, 10rem);
  margin-top: -1px;

  background-color: var(--surface-color);
  pointer-events: all;

  &__title {
    margin-bottom: 3rem;

    transition: color 400ms;

    // NOTE: smoothscroll (locomotive scroll) breakpoint
    @media screen and (min-width: 1024px) {
      margin-bottom: 6rem;
    }
  }

  &__list {
    display: grid;
    justify-items: center;
    align-items: start;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    column-gap: clamp(2rem, 5vw, 4.5rem);
    row-gap: clamp(4rem, 6vw, 6.5rem);

    max-width: 1100px;

    list-style-type: none;
    margin: 0 auto;
    padding-inline-start: 0;

    @media screen and (min-width: 850px) {
      margin-block-start: 4rem;
    }
  }

  @media (prefers-color-scheme: light) {
    color: #252525;
  }
}
</style>
