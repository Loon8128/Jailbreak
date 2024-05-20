// Allow player to use all backgrounds, including identifying them with a 'custom' tag.
(() => {
    const backgrounds = [
        'Shop',
        'Pandora/Ground/Entrance',
        'Pandora/Second/Entrance',
        'Pandora/Underground/Entrance'
    ];
    const specialBackgroundTag = 'Special';
    const addedBackgroundTags = ['Asylum', specialBackgroundTag];
    
    // Pandora backgrounds
    for (let i = 0; i < 6; i++) {
        ['Cell', 'Fork', 'Tunnel'].forEach(shape => backgrounds.push(`Pandora/Second/${shape}${i}`, `Pandora/Underground/${shape}${i}`));
    }
    
    backgrounds.forEach(bg => BackgroundsList.push({Name: bg, Tag: [specialBackgroundTag]}));
    addedBackgroundTags.forEach(tag => BackgroundsTagList.push(tag));
})();