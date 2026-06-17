import { agentProfiles, buyerProfiles } from '@/db/tables'
import type { getDb } from '@/db/connection'
import { eq } from 'drizzle-orm'
import type {
	AgentProfileData,
	QuestionnaireAnswers,
	UserSettings,
} from '@/lib/matching/settings'
import {
	agentQuestionFlow,
	buyerQuestionFlow,
	type CoreQuestion,
} from '@/lib/matching/questions'

type Db = ReturnType<typeof getDb>
type AnswerValue = QuestionnaireAnswers[string]

const DEFAULT_STATUS = 'draft' as const

export async function getUserSettingsDb(
	db: Db,
	userId: string,
): Promise<UserSettings | null> {
	const [buyer, agent] = await Promise.all([
		findBuyerProfileByUserId(db, userId),
		findAgentProfileByUserId(db, userId),
	])
	const profiles = [
		buyer
			? {
					role: 'consumer' as const,
					flowKind: 'buyer' as const,
					profile: buyer,
				}
			: null,
		agent ? { role: 'agent' as const, profile: agent } : null,
	].filter((item) => item !== null)

	if (profiles.length === 0) return null

	profiles.sort(
		(a, b) => b.profile.updatedAt.getTime() - a.profile.updatedAt.getTime(),
	)
	const latest = profiles[0]!

	if (latest.role === 'agent') {
		return getAgentSettings(latest.profile)
	}

	return getBuyerSettings(latest.profile)
}

export async function saveUserSettingsDb(
	db: Db,
	userId: string,
	settings: UserSettings,
): Promise<void> {
	if (settings.role === 'agent') {
		await saveAgentSettingsDb(db, userId, settings)
		return
	}

	await saveBuyerSettingsDb(db, userId, settings)
}

export async function updateAnswersDb(
	db: Db,
	userId: string,
	answers: QuestionnaireAnswers,
): Promise<void> {
	const current = (await getUserSettingsDb(db, userId)) ?? getDefaultSettings()
	await saveUserSettingsDb(db, userId, { ...current, answers })
}

export async function updateAgentProfileDb(
	db: Db,
	userId: string,
	profile: AgentProfileData,
): Promise<void> {
	const current =
		(await getUserSettingsDb(db, userId)) ?? getDefaultSettings('agent')
	await saveUserSettingsDb(db, userId, {
		...current,
		role: 'agent',
		agentProfile: profile,
	})
}

export async function resetUserSettingsDb(
	db: Db,
	userId: string,
): Promise<void> {
	await Promise.all([
		db.delete(buyerProfiles).where(eq(buyerProfiles.userId, userId)),
		db.delete(agentProfiles).where(eq(agentProfiles.userId, userId)),
	])
}

async function saveBuyerSettingsDb(
	db: Db,
	userId: string,
	settings: UserSettings,
) {
	const now = new Date()
	const existing = await findBuyerProfileByUserId(db, userId)
	const values = {
		status: DEFAULT_STATUS,
		location: settings.zipCode ?? existing?.location ?? null,
		priceRange:
			settings.priceRange ??
			answerToOption(
				buyerQuestionFlow.questions,
				'B.1',
				settings.answers['B.1'],
			) ??
			existing?.priceRange ??
			null,
		propertyTypesJson:
			settings.propertyType ??
			answerToOptions(
				buyerQuestionFlow.questions,
				'B.3',
				settings.answers['B.3'],
			) ??
			existing?.propertyTypesJson ??
			null,
		intent: settings.intent ?? existing?.intent ?? null,
		experienceLevel:
			settings.experienceLevel ??
			answerToOption(
				buyerQuestionFlow.questions,
				'B.4',
				settings.answers['B.4'],
			) ??
			existing?.experienceLevel ??
			null,
		preferredContactMethod:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.6',
				settings.answers['B.6'],
			) ??
			existing?.preferredContactMethod ??
			null,
		updateDeliveryPreference:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.7',
				settings.answers['B.7'],
			) ??
			existing?.updateDeliveryPreference ??
			null,
		responseTimeExpectation:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.13',
				settings.answers['B.13'],
			) ??
			existing?.responseTimeExpectation ??
			null,
		agentRolePreference:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.5',
				settings.answers['B.5'],
			) ??
			existing?.agentRolePreference ??
			null,
		involvementLevel:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.11',
				settings.answers['B.11'],
			) ??
			existing?.involvementLevel ??
			null,
		decisionStyle:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.8',
				settings.answers['B.8'],
			) ??
			existing?.decisionStyle ??
			null,
		toughLossPreference:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.9',
				settings.answers['B.9'],
			) ??
			existing?.toughLossPreference ??
			null,
		agentNonNegotiablesJson:
			answerToOptions(
				buyerQuestionFlow.questions,
				'B.10',
				settings.answers['B.10'],
			) ??
			existing?.agentNonNegotiablesJson ??
			null,
		representationPreference:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.12',
				settings.answers['B.12'],
			) ??
			existing?.representationPreference ??
			null,
		commissionComfort:
			answerToOption(
				buyerQuestionFlow.questions,
				'B.14',
				settings.answers['B.14'],
			) ??
			existing?.commissionComfort ??
			null,
		matchPrioritiesJson:
			settings.matchPriorities ?? existing?.matchPrioritiesJson ?? null,
		updatedAt: now,
	} satisfies Partial<typeof buyerProfiles.$inferInsert>

	if (existing) {
		await db
			.update(buyerProfiles)
			.set(values)
			.where(eq(buyerProfiles.id, existing.id))
		return
	}

	await db.insert(buyerProfiles).values({
		id: crypto.randomUUID(),
		userId,
		...values,
		createdAt: now,
	})
}

async function saveAgentSettingsDb(
	db: Db,
	userId: string,
	settings: UserSettings,
) {
	const now = new Date()
	const existing = await findAgentProfileByUserId(db, userId)
	const profile = settings.agentProfile
	const values = {
		status: DEFAULT_STATUS,
		representationSide:
			settings.agentRepresentation ??
			answerToOption(
				agentQuestionFlow.questions,
				'A.1',
				settings.answers['A.1'],
			) ??
			existing?.representationSide ??
			null,
		typicalPriceRange:
			answerToOption(
				agentQuestionFlow.questions,
				'A.2',
				settings.answers['A.2'],
			) ??
			existing?.typicalPriceRange ??
			null,
		bestClientTypesJson:
			answerToOptions(
				agentQuestionFlow.questions,
				'A.3',
				settings.answers['A.3'],
			) ??
			existing?.bestClientTypesJson ??
			null,
		notFitFor:
			textAnswer(settings.answers['A.12']) ?? existing?.notFitFor ?? null,
		workingStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.4',
				settings.answers['A.4'],
			) ??
			existing?.workingStyle ??
			null,
		dealStressStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.8',
				settings.answers['A.8'],
			) ??
			existing?.dealStressStyle ??
			null,
		communicationCadence:
			answerToOption(
				agentQuestionFlow.questions,
				'A.5',
				settings.answers['A.5'],
			) ??
			existing?.communicationCadence ??
			null,
		quickContactStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.6',
				settings.answers['A.6'],
			) ??
			existing?.quickContactStyle ??
			null,
		updateDeliveryStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.7',
				settings.answers['A.7'],
			) ??
			existing?.updateDeliveryStyle ??
			null,
		responseTime:
			answerToOption(
				agentQuestionFlow.questions,
				'A.9',
				settings.answers['A.9'],
			) ??
			existing?.responseTime ??
			null,
		commissionStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.10',
				settings.answers['A.10'],
			) ??
			existing?.commissionStyle ??
			null,
		dualAgencyStyle:
			answerToOption(
				agentQuestionFlow.questions,
				'A.11',
				settings.answers['A.11'],
			) ??
			existing?.dualAgencyStyle ??
			null,
		firstName: profile?.firstName ?? existing?.firstName ?? null,
		lastName: profile?.lastName ?? existing?.lastName ?? null,
		brokerageName: profile?.brokerageName ?? existing?.brokerageName ?? null,
		email: profile?.email ?? existing?.email ?? null,
		phone: profile?.phone ?? existing?.phone ?? null,
		businessAddress:
			profile?.businessAddress ?? existing?.businessAddress ?? null,
		billingAddress: profile?.billingAddress ?? existing?.billingAddress ?? null,
		licenseNumberState:
			profile?.licenseNumberState ?? existing?.licenseNumberState ?? null,
		serviceArea1: profile?.serviceArea1 ?? existing?.serviceArea1 ?? null,
		serviceArea2: profile?.serviceArea2 ?? existing?.serviceArea2 ?? null,
		serviceArea3: profile?.serviceArea3 ?? existing?.serviceArea3 ?? null,
		yearsLicensed:
			profile?.yearsLicensed ??
			profile?.experience ??
			existing?.yearsLicensed ??
			null,
		averageTransactions:
			profile?.averageTransactions ?? existing?.averageTransactions ?? null,
		employmentStatus:
			profile?.employmentStatus ?? existing?.employmentStatus ?? null,
		licenseProof: profile?.licenseProof ?? existing?.licenseProof ?? null,
		clientFirstTerms:
			profile?.clientFirstTerms ?? existing?.clientFirstTerms ?? null,
		valueProposition:
			profile?.valueProposition ?? existing?.valueProposition ?? null,
		usePaxWriter: profile?.usePaxWriter ?? existing?.usePaxWriter ?? true,
		introVideo: profile?.introVideo ?? existing?.introVideo ?? null,
		updatedAt: now,
	} satisfies Partial<typeof agentProfiles.$inferInsert>

	if (existing) {
		await db
			.update(agentProfiles)
			.set(values)
			.where(eq(agentProfiles.id, existing.id))
		return
	}

	await db.insert(agentProfiles).values({
		id: crypto.randomUUID(),
		userId,
		...values,
		createdAt: now,
	})
}

function getBuyerSettings(
	profile: typeof buyerProfiles.$inferSelect,
): UserSettings {
	return {
		role: 'consumer',
		flowKind: 'buyer',
		...(profile.location ? { zipCode: profile.location } : {}),
		...(profile.priceRange ? { priceRange: profile.priceRange } : {}),
		...(profile.propertyTypesJson
			? { propertyType: profile.propertyTypesJson }
			: {}),
		...(profile.intent ? { intent: profile.intent } : {}),
		...(profile.experienceLevel
			? { experienceLevel: profile.experienceLevel }
			: {}),
		...(profile.matchPrioritiesJson
			? { matchPriorities: profile.matchPrioritiesJson }
			: {}),
		answers: compactAnswers({
			'B.1': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.1',
				profile.priceRange,
			),
			'B.3': optionsToAnswer(
				buyerQuestionFlow.questions,
				'B.3',
				profile.propertyTypesJson,
			),
			'B.4': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.4',
				profile.experienceLevel,
			),
			'B.5': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.5',
				profile.agentRolePreference,
			),
			'B.6': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.6',
				profile.preferredContactMethod,
			),
			'B.7': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.7',
				profile.updateDeliveryPreference,
			),
			'B.8': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.8',
				profile.decisionStyle,
			),
			'B.9': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.9',
				profile.toughLossPreference,
			),
			'B.10': optionsToAnswer(
				buyerQuestionFlow.questions,
				'B.10',
				profile.agentNonNegotiablesJson,
			),
			'B.11': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.11',
				profile.involvementLevel,
			),
			'B.12': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.12',
				profile.representationPreference,
			),
			'B.13': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.13',
				profile.responseTimeExpectation,
			),
			'B.14': optionToAnswer(
				buyerQuestionFlow.questions,
				'B.14',
				profile.commissionComfort,
			),
		}),
		updatedAt: profile.updatedAt.toISOString(),
	}
}

function getAgentSettings(
	profile: typeof agentProfiles.$inferSelect,
): UserSettings {
	return {
		role: 'agent',
		...(profile.representationSide
			? { agentRepresentation: profile.representationSide }
			: {}),
		answers: compactAnswers({
			'A.1': optionToAnswer(
				agentQuestionFlow.questions,
				'A.1',
				profile.representationSide,
			),
			'A.2': optionToAnswer(
				agentQuestionFlow.questions,
				'A.2',
				profile.typicalPriceRange,
			),
			'A.3': optionsToAnswer(
				agentQuestionFlow.questions,
				'A.3',
				profile.bestClientTypesJson,
			),
			'A.4': optionToAnswer(
				agentQuestionFlow.questions,
				'A.4',
				profile.workingStyle,
			),
			'A.5': optionToAnswer(
				agentQuestionFlow.questions,
				'A.5',
				profile.communicationCadence,
			),
			'A.6': optionToAnswer(
				agentQuestionFlow.questions,
				'A.6',
				profile.quickContactStyle,
			),
			'A.7': optionToAnswer(
				agentQuestionFlow.questions,
				'A.7',
				profile.updateDeliveryStyle,
			),
			'A.8': optionToAnswer(
				agentQuestionFlow.questions,
				'A.8',
				profile.dealStressStyle,
			),
			'A.9': optionToAnswer(
				agentQuestionFlow.questions,
				'A.9',
				profile.responseTime,
			),
			'A.10': optionToAnswer(
				agentQuestionFlow.questions,
				'A.10',
				profile.commissionStyle,
			),
			'A.11': optionToAnswer(
				agentQuestionFlow.questions,
				'A.11',
				profile.dualAgencyStyle,
			),
			'A.12': profile.notFitFor ?? undefined,
		}),
		agentProfile: {
			firstName: profile.firstName ?? '',
			lastName: profile.lastName ?? '',
			brokerageName: profile.brokerageName ?? '',
			email: profile.email ?? '',
			phone: profile.phone ?? '',
			businessAddress: profile.businessAddress ?? '',
			billingAddress: profile.billingAddress ?? '',
			licenseNumberState: profile.licenseNumberState ?? '',
			serviceArea1: profile.serviceArea1 ?? '',
			serviceArea2: profile.serviceArea2 ?? '',
			serviceArea3: profile.serviceArea3 ?? '',
			yearsLicensed: profile.yearsLicensed ?? '',
			averageTransactions: profile.averageTransactions ?? '',
			employmentStatus: profile.employmentStatus ?? '',
			licenseProof: profile.licenseProof ?? '',
			clientFirstTerms: profile.clientFirstTerms ?? '',
			valueProposition: profile.valueProposition ?? '',
			usePaxWriter: profile.usePaxWriter,
			introVideo: profile.introVideo ?? '',
			experience: profile.yearsLicensed ?? '',
			zipCodes: [
				profile.serviceArea1,
				profile.serviceArea2,
				profile.serviceArea3,
			]
				.filter(Boolean)
				.join(', '),
			services: profile.bestClientTypesJson ?? [],
		},
		updatedAt: profile.updatedAt.toISOString(),
	}
}

function answerToOption(
	questions: CoreQuestion[],
	questionId: string,
	answer: AnswerValue | undefined,
) {
	if (typeof answer === 'string') return answer
	if (typeof answer !== 'number') return undefined
	return questions.find((question) => question.id === questionId)?.options?.[
		answer
	]
}

function answerToOptions(
	questions: CoreQuestion[],
	questionId: string,
	answer: AnswerValue | undefined,
) {
	if (!Array.isArray(answer)) return undefined
	const options = questions.find(
		(question) => question.id === questionId,
	)?.options
	const selected = answer
		.map((index) => options?.[index])
		.filter((option): option is string => Boolean(option))
	return selected.length > 0 ? selected : undefined
}

function optionToAnswer(
	questions: CoreQuestion[],
	questionId: string,
	value?: string | null,
) {
	if (!value) return undefined
	const options = questions.find(
		(question) => question.id === questionId,
	)?.options
	const index = options?.indexOf(value) ?? -1
	return index >= 0 ? index : undefined
}

function optionsToAnswer(
	questions: CoreQuestion[],
	questionId: string,
	values?: string[] | null,
) {
	if (!values?.length) return undefined
	const options = questions.find(
		(question) => question.id === questionId,
	)?.options
	const selected = values
		.map((value) => options?.indexOf(value) ?? -1)
		.filter((index) => index >= 0)
	return selected.length > 0 ? selected : undefined
}

function textAnswer(answer: AnswerValue | undefined) {
	return typeof answer === 'string' && answer.trim() ? answer : undefined
}

function compactAnswers(answers: Record<string, AnswerValue | undefined>) {
	return Object.fromEntries(
		Object.entries(answers).filter(([, value]) => value !== undefined),
	) as QuestionnaireAnswers
}

async function findBuyerProfileByUserId(db: Db, userId: string) {
	const [profile] = await db
		.select()
		.from(buyerProfiles)
		.where(eq(buyerProfiles.userId, userId))
	return profile
}

async function findAgentProfileByUserId(db: Db, userId: string) {
	const [profile] = await db
		.select()
		.from(agentProfiles)
		.where(eq(agentProfiles.userId, userId))
	return profile
}

function getDefaultSettings(
	role: 'consumer' | 'agent' = 'consumer',
): UserSettings {
	return {
		role,
		answers: {},
		...(role === 'agent'
			? {
					agentProfile: {
						experience: '',
						zipCodes: '',
						services: [],
					},
				}
			: { flowKind: 'buyer' as const }),
		updatedAt: new Date().toISOString(),
	}
}
