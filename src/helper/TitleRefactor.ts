  export const TitleRefactor = (title: string) => {
    if (title.includes('%20')) {
      return title.replace(/%20/g, ' ');
    }

    return title;
  };