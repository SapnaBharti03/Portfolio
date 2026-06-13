import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { Field } from "@/admin/components/Field"
import { toast } from "sonner"
import { useSiteBranding } from "@/hooks/useSiteBranding"

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const { name } = useSiteBranding()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      const fe: typeof errors = {}
      parsed.error.issues.forEach((i) => {
        fe[i.path[0] as "email" | "password"] = i.message
      })
      setErrors(fe)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await login(parsed.data.email, parsed.data.password)
      toast.success("Welcome back!")
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background bg-mesh flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-elegant"
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-primary glow mb-4" />
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {name} portfolio control panel
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email" error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                placeholder="you@example.com"
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                placeholder="••••••••"
              />
            </div>
          </Field>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Need an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  )
}