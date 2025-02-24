export interface RandomUsers {
    id: string,
    name: string,
    image: string
}

//Layout
export interface MenuItemTypes {
    iconString: string,
    colorString: string,
    sizeString: string
}

export interface MenuItemFollowCompTypes {
    user: RandomUsers
}