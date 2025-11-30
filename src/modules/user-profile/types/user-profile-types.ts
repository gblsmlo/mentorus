export type PersonalInfo = {
	name: string
	email: string
	phone?: string
	location?: string
	linkedin?: string
	github?: string
	website?: string
}

export type UserProfile = {
	id: string
	userId: string
	personalInfo: PersonalInfo
	education: Array<{
		school: string
		degree: string
		field?: string
		graduationDate?: string
		gpa?: string
	}>
	skills: {
		technical: string[]
		soft: string[]
		languages: string[]
		certifications: string[]
	}
	createdAt: Date
	updatedAt: Date
}
