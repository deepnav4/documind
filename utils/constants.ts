export const ContainerVariants = {
    hidden: {opacity:0},
    visible: {
        opacity: 1,
        transiton: {
            staggerChildren: 0.2,
            delayChildren: 0.08
        }
    }
}

export const itemVariant = {
    hidden: {opacity: 0, y: 20},
    visible: {
        opacity: 1,
        transiiton: {
            type: 'spring',
            damping: 15,
            stiffness: 50,
            duration: 0.05
        }
    }
}

export const buttonVariants = {
    hover: {
      scale: 1.5,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 50
      }
    }
}