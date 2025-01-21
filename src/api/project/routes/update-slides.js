module.exports = [
    {
      method: 'PUT',
      path: '/projects/:id/update-slides',
      handler: 'project.updateSlides',
      config: {
        policies: [],
      },
    },
  ];
